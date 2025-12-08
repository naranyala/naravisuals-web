// spectrum_glow_plugin.js
// Drop-in spectral visualiser for daw_core
// Usage: daw.register('spectrum', SpectrumGlowPlugin, {canvas: myCanvas});
//        then inside RAF: daw.get('spectrum').draw();

export class SpectrumGlowPlugin {
  constructor(daw, opts = {}) {
    this.daw = daw;
    this.analyser = daw.master.analyser; // already connected to master gain
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.peakArray = new Uint8Array(this.bufferLength); // for glow decay

    // Optional canvas (can be supplied later via .mount())
    this.canvas = opts.canvas ?? document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.barCount = opts.bars ?? 128; // how many bars to draw
    this.decay = opts.decay ?? 0.85;  // peak hold decay factor
    this.mode = opts.mode ?? 'bars';  // 'bars' | 'circle'
    this.hueShift = opts.hueShift ?? 0; // base hue for colour mapping
  }

  // Attach/re-attach canvas at runtime
  mount(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  // Call every requestAnimationFrame
  draw() {
    this.analyser.getByteFrequencyData(this.dataArray);
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Update peak hold array
    for (let i = 0; i < this.bufferLength; i++) {
      this.peakArray[i] = Math.max(this.dataArray[i], this.peakArray[i] * this.decay);
    }

    if (this.mode === 'bars') {
      this.#drawBars(width, height);
    } else if (this.mode === 'circle') {
      this.#drawCircle(width, height);
    }
  }

  // ----------------------------------------------------------
  // Private drawers
  // ----------------------------------------------------------
  #drawBars(w, h) {
    const barWidth = w / this.barCount;
    const step = Math.floor(this.bufferLength / this.barCount);

    for (let i = 0; i < this.barCount; i++) {
      const idx = i * step;
      const value = this.dataArray[idx];
      const peak = this.peakArray[idx];
      const barHeight = (value / 255) * h;

      // Gradient bar
      const x = i * barWidth;
      const gradient = this.ctx.createLinearGradient(0, h, 0, h - barHeight);
      const hue = (this.hueShift + i * 2) % 360;
      gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${hue}, 100%, 10%)`);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);

      // Glow peak line
      const peakY = h - (peak / 255) * h;
      this.ctx.strokeStyle = `hsl(${hue}, 100%, 80%)`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, peakY);
      this.ctx.lineTo(x + barWidth - 2, peakY);
      this.ctx.stroke();
    }
  }

  #drawCircle(w, h) {
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.3;
    const angleStep = (2 * Math.PI) / this.barCount;
    const step = Math.floor(this.bufferLength / this.barCount);

    for (let i = 0; i < this.barCount; i++) {
      const idx = i * step;
      const value = this.dataArray[idx];
      const peak = this.peakArray[idx];
      const angle = i * angleStep - Math.PI / 2; // start at top
      const barLength = (value / 255) * radius;
      const peakLength = (peak / 255) * radius;

      // Bar
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      const hue = (this.hueShift + i * 3) % 360;
      this.ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      // Glow peak dot
      const px = centerX + Math.cos(angle) * (radius + peakLength);
      const py = centerY + Math.sin(angle) * (radius + peakLength);
      this.ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}


// import { SpectrumGlowPlugin } from './spectrum_glow_plugin.js';
//
// await daw.init();
// const canvas = document.querySelector('#viz');
// daw.register('spectrum', SpectrumGlowPlugin, { canvas, mode: 'circle' });
//
// function loop() {
//   daw.get('spectrum').draw();
//   requestAnimationFrame(loop);
// }
// loop();
