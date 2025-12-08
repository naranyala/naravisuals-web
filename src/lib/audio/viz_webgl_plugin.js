// viz_webgl_plugin.js
// Organic, shader-driven visuals for daw_core
// Usage:
//   await daw.init();
//   daw.register('viz_webgl', vizWebglPlugin, {canvas: myCanvas});
//   const vizWebgl = daw.get('viz_webgl');
//   requestAnimationFrame(function loop(t){
//       vizWebgl.update(t);   // computes audio uniforms
//       vizWebgl.render();    // draws frame
//       requestAnimationFrame(loop);
//   });

export class VizWebglPlugin {
  constructor(daw, opts = {}) {
    this.daw = daw;
    this.canvas = opts.canvas ?? document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) return this.#fallbackCanvas(); // keep API identical

    // ---- audio analysers ----
    this.fftSize = 4096;
    this.hop = 1024;
    this.analyser = daw.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0;
    daw.master.gain.connect(this.analyser);
    this.freq = new Uint8Array(this.fftSize >> 1);
    this.time = new Uint8Array(this.fftSize);

    // ---- double-buffer spectral texture ----
    this.texWidth = 256;  // time slices
    this.texHeight = this.fftSize >> 1; // freq bins
    this.spectrumBuffer = new Uint8Array(this.texWidth * this.texHeight);
    this.writePtr = 0;

    // ---- WebGL boilerplate ----
    this.#initGL();
    this.#buildProgram();
    this.#makeTexture();
    this.#makeQuad();
  }

  // ----------------------------------------------------------
  // Public API (same whether WebGL or fallback)
  // ----------------------------------------------------------
  update(time_ms) {
    this.analyser.getByteFrequencyData(this.freq);
    this.analyser.getByteTimeDomainData(this.time);

    // roll circular buffer
    for (let y = 0; y < this.texHeight; y++) {
      this.spectrumBuffer[this.writePtr + y] = this.freq[y];
    }
    this.writePtr = (this.writePtr + this.texHeight) % this.spectrumBuffer.length;

    // compute tasty uniforms
    const centroid = this.#spectralCentroid();
    const flux = this.#spectralFlux();
    const rms = this.#rms();
    this.uniforms = {
      u_time: time_ms * 0.001,
      u_centroid: centroid,
      u_flux: flux,
      u_rms: rms,
      u_resolution: [this.canvas.width, this.canvas.height],
      u_spectrum: 0 // texture unit
    };
  }

  render() {
    if (!this.gl) { this.#cpuDraw(); return; }

    const gl = this.gl;
    // upload latest spectral strip
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0,
      this.writePtr / this.texHeight, 0,
      1, this.texHeight,
      gl.LUMINANCE, gl.UNSIGNED_BYTE,
      this.freq);

    // set uniforms
    for (let [name, val] of Object.entries(this.uniforms)) {
      const loc = gl.getUniformLocation(this.program, name);
      if (typeof val === 'number') gl.uniform1f(loc, val);
      else if (val.length === 2) gl.uniform2fv(loc, val);
      else if (val === 0) gl.uniform1i(loc, 0);
    }

    // draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ----------------------------------------------------------
  // Audio feature helpers
  // ----------------------------------------------------------
  #spectralCentroid() {
    let num = 0, den = 0;
    for (let i = 0; i < this.freq.length; i++) {
      const f = (i / this.freq.length) * (this.daw.audioContext.sampleRate / 2);
      num += f * this.freq[i];
      den += this.freq[i];
    }
    return den ? num / den : 0;
  }
  #spectralFlux() {
    let flux = 0;
    for (let i = 0; i < this.freq.length; i++) {
      const d = this.freq[i] - (this.prevFreq ? this.prevFreq[i] : 0);
      if (d > 0) flux += d;
    }
    this.prevFreq = Uint8Array.from(this.freq);
    return flux / 255;
  }
  #rms() {
    let sum = 0;
    for (let v of this.time) sum += Math.pow((v - 128) / 128, 2);
    return Math.sqrt(sum / this.time.length);
  }

  // ----------------------------------------------------------
  // WebGL setup
  // ----------------------------------------------------------
  #initGL() {
    const gl = this.gl;
    gl.getExtension('OES_texture_float_linear');
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  #makeTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE,
      this.texWidth, this.texHeight, 0,
      gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  #makeQuad() {
    const gl = this.gl;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  }
  #buildProgram() {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `#version 300 es
      in vec2 aPos; in vec2 aUV;
      out vec2 vUV;
      void main(){ vUV = aUV; gl_Position = vec4(aPos,0,1); }`);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `#version 300 es
      precision highp float;
      in  vec2 vUV;
      out vec4 fragColor;
      uniform sampler2D u_spectrum;
      uniform float u_time;
      uniform float u_centroid;
      uniform float u_flux;
      uniform float u_rms;
      uniform vec2  u_resolution;

      // ---- 2D noise ----
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);
        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+1.);
        vec2 u=f*f*(3.-2.*f);
        return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy/u_resolution;
        vec2 p  = uv*4. - vec2(2.);
        float t = u_time;

        // read spectral column (time scrolls vertically)
        float col = texture(u_spectrum, vec2(vUV.x, fract(t*0.1))).r;

        // fluid nebula
        vec2  warp = vec2(noise(p+t*0.2),noise(p+t*0.15))*0.3;
        float dens = noise(p+warp+t*0.3) + col*u_rms*3.;
        dens += noise(p*3.-t*0.5)*0.2;

        // ink drops driven by flux
        vec2  drop = vec2(sin(t+u_centroid*0.01),cos(t*0.7))*0.5;
        float ink  = smoothstep(0.4,0.2,length(p-drop)) * u_flux;

        vec3 base = 0.6 + 0.4*sin(vec3(1,2,3)*dens*3. + u_centroid*0.02);
        base = mix(base, vec3(1,0.9,0.7), ink);

        fragColor = vec4(base,1.0);
      }`);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);
  }

  // ----------------------------------------------------------
  // Fallback 2-D canvas (keeps same uniforms object)
  // ----------------------------------------------------------
  #fallbackCanvas() {
    this.ctx = this.canvas.getContext('2d');
    this.render = () => this.#cpuDraw();
  }
  #cpuDraw() {
    const ctx = this.ctx;
    const { width: w, height: h } = this.canvas;
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);
    const hue = (this.uniforms.u_centroid / 1000) * 360;
    const rad = this.uniforms.u_rms * Math.min(w, h) * 0.4;
    ctx.fillStyle = `hsl(${hue},70%,60%)`;
    ctx.beginPath();
    ctx.arc(w / 2 + Math.sin(this.uniforms.u_time) * w / 4,
      h / 2 + Math.cos(this.uniforms.u_time * 0.7) * h / 4,
      rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

// await daw.init();
// const canvas = document.querySelector('canvas');
// daw.register('viz_webgl', vizWebglPlugin, {canvas});
// const aether = daw.get('viz_webgl');
//
// function frame(t){
//   aether.update(t);
//   aether.render();
//   requestAnimationFrame(frame);
// }
// requestAnimationFrame(frame);
