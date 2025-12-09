// audio_widgets_plugin.js
// Browser-canvas audio widgets for daw_core
// Usage:
//   daw.register('widgets', AudioWidgetsPlugin);
//   const W = daw.get('widgets');
//   document.body.append(W.meter(150,40));   // 150×40 px VU
//   document.body.append(W.tuner(200,200));  // 200×200 pitch wheel
//   document.body.append(W.wave(300,100));   // mini oscilloscope

export class AudioWidgetsPlugin {
  constructor(daw) {
    this.daw = daw;
    this.analyser = daw.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    daw.master.gain.connect(this.analyser);
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.time = new Uint8Array(this.analyser.frequencyBinCount);
  }

  // ----------------------------------------------------------
  // Factory helpers (return <canvas> elements already wired)
  // ----------------------------------------------------------
  meter(w = 150, h = 40) {
    const c = this.#canvas(w, h);
    const ctx = c.getContext('2d');
    const tick = () => {
      this.analyser.getByteFrequencyData(this.freq);
      const v = this.freq.slice(0, 20).reduce((a, b) => a + b) / 20 / 255;
      ctx.clearRect(0, 0, w, h);
      // background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      // bar
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#0f0');
      grad.addColorStop(0.7, '#ff0');
      grad.addColorStop(1, '#f00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, v * w, h);
      // peak hold
      if (!c.peak) c.peak = 0;
      c.peak = Math.max(v, c.peak * 0.95);
      ctx.fillStyle = '#fff';
      ctx.fillRect(c.peak * w - 2, 0, 2, h);
      requestAnimationFrame(tick);
    };
    tick();
    return c;
  }

  tuner(w = 200, h = 200) {
    const c = this.#canvas(w, h);
    const ctx = c.getContext('2d');
    const tick = () => {
      this.analyser.getByteTimeDomainData(this.time);
      const pitch = this.#autoCorrelate(this.time, this.daw.audioContext.sampleRate);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) * 0.8;
      // dial
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // needle
      if (pitch) {
        const cents = 1200 * Math.log2(pitch / 440);
        const angle = (cents / 100) * 0.3; // ±30 deg
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r);
        ctx.stroke();
        ctx.restore();
        // text
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(pitch.toFixed(1) + ' Hz', 5, h - 5);
      }
      requestAnimationFrame(tick);
    };
    tick();
    return c;
  }

  wave(w = 300, h = 100) {
    const c = this.#canvas(w, h);
    const ctx = c.getContext('2d');
    const tick = () => {
      this.analyser.getByteTimeDomainData(this.time);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const slice = w / this.time.length;
      for (let i = 0; i < this.time.length; i++) {
        const v = (this.time[i] - 128) / 128;
        const y = v * h / 2 + h / 2;
        i ? ctx.lineTo(i * slice, y) : ctx.moveTo(i * slice, y);
      }
      ctx.stroke();
      requestAnimationFrame(tick);
    };
    tick();
    return c;
  }

  spectro(w = 300, h = 150) {
    const c = this.#canvas(w, h);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const roll = new Uint8ClampedArray(w * h * 4);
    const tick = () => {
      this.analyser.getByteFrequencyData(this.freq);
      // scroll left
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w - 1; x++) {
          const idx = (x + 1 + y * w) * 4;
          const prev = (x + y * w) * 4;
          roll[idx] = roll[prev];
          roll[idx + 1] = roll[prev + 1];
          roll[idx + 2] = roll[prev + 2];
        }
      }
      // write new column
      const step = Math.floor(this.freq.length / h);
      for (let y = 0; y < h; y++) {
        const v = this.freq[y * step];
        const x = 0;
        const idx = (x + y * w) * 4;
        const hue = (v / 255) * 240;
        const rgb = hsl(hue, 100, 50);
        roll[idx] = rgb.r;
        roll[idx + 1] = rgb.g;
        roll[idx + 2] = rgb.b;
        roll[idx + 3] = 255;
      }
      img.data.set(roll);
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(tick);
    };
    tick();
    return c;
  }

  // ----------------------------------------------------------
  // Util
  // ----------------------------------------------------------
  #canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.style.display = 'block';
    return c;
  }

  #autoCorrelate(buf, sampleRate) {
    const minLag = Math.floor(sampleRate / 1200);
    const maxLag = Math.floor(sampleRate / 80);
    let best = 0, bestLag = 0;
    for (let lag = minLag; lag < maxLag; lag++) {
      let num = 0, denL = 0, denR = 0;
      for (let i = 0; i < buf.length - lag; i++) {
        const x = (buf[i] - 128) / 128;
        const y = (buf[i + lag] - 128) / 128;
        num += x * y; denL += x * x; denR += y * y;
      }
      const r = denL && denR ? num / Math.sqrt(denL * denR) : 0;
      if (r > best) { best = r; bestLag = lag; }
    }
    return best > 0.7 ? sampleRate / bestLag : null;
  }
}

// ---- tiny hsl→rgb helper ----
function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}

// await daw.init();
// daw.register('widgets', AudioWidgetsPlugin);
// const W = daw.get('widgets');
//
// document.body.append(W.meter(200, 30));
// document.body.append(W.tuner(180, 180));
// document.body.append(W.wave(400, 100));
// document.body.append(W.spectro(400, 150));
