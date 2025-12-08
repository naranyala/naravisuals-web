// viz_catalog_plugin.js
// Tiny "catalogue" of ultra-minimal visualizers for daw_core
// Usage:
//   daw.register('viz', VizCatalogPlugin);
//   const visual = daw.get('viz').use('bars', canvas);
//   requestAnimationFrame(function loop(){ visual.draw(); requestAnimationFrame(loop); });

export class VizCatalogPlugin {
  constructor(daw) {
    this.daw = daw;
    this.analyser = daw.master.analyser;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.freqArray = new Uint8Array(this.bufferLength);
    this.timeArray = new Uint8Array(this.bufferLength);
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------
  list() {
    return Object.keys(catalogue);
  }

  // Factory: pick a visualiser by name
  use(name, canvas, opts = {}) {
    if (!catalogue[name]) throw new Error('Unknown visualiser: ' + name);
    return catalogue[name](this, canvas, opts);
  }

  // ----------------------------------------------------------
  // Micro-library of visuals (add your own here)
  // ----------------------------------------------------------
}

// --------- catalogue of bare-bones visuals ------------------
const catalogue = {};

// 1. Bars
catalogue.bars = (host, canvas) => ({
  draw() {
    host.analyser.getByteFrequencyData(host.freqArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const bar = w / host.bufferLength;
    for (let i = 0; i < host.bufferLength; i++) {
      const v = host.freqArray[i];
      ctx.fillStyle = `hsl(${120 - v / 2}, 100%, 50%)`;
      ctx.fillRect(i * bar, h, bar - 1, -v / 255 * h);
    }
  }
});

// 2. Circle
catalogue.circle = (host, canvas) => ({
  draw() {
    host.analyser.getByteFrequencyData(host.freqArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
    const step = 2 * Math.PI / host.bufferLength;
    for (let i = 0; i < host.bufferLength; i++) {
      const v = host.freqArray[i] / 255;
      const angle = i * step - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * r;
      const y1 = cy + Math.sin(angle) * r;
      const x2 = cx + Math.cos(angle) * (r + v * r);
      const y2 = cy + Math.sin(angle) * (r + v * r);
      ctx.strokeStyle = `hsl(${i / host.bufferLength * 360}, 100%, 60%)`;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }
});

// 3. Waveform
catalogue.wave = (host, canvas) => ({
  draw() {
    host.analyser.getByteTimeDomainData(host.timeArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2; ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    const slice = w / host.bufferLength;
    for (let i = 0; i < host.bufferLength; i++) {
      const v = host.timeArray[i] / 128; // -1..1 → 0..2
      const y = v * h / 2;
      i ? ctx.lineTo(i * slice, y) : ctx.moveTo(i * slice, y);
    }
    ctx.stroke();
  }
});

// 4. Stereo-scope (L vs R scatter)
catalogue.stereo = (host, canvas) => ({
  draw() {
    host.analyser.getByteTimeDomainData(host.timeArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, w, h);
    const mid = host.bufferLength / 2;
    const x = (host.timeArray[mid] / 128 - 1) * w / 2 + w / 2;
    const y = (host.timeArray[0] / 128 - 1) * h / 2 + h / 2;
    ctx.fillStyle = `hsl(${Math.abs(x - w / 2)}, 100%, 50%)`;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
});

// 5. Note-wheel (12-TET polar)
catalogue.notes = (host, canvas) => ({
  draw() {
    host.analyser.getByteFrequencyData(host.freqArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const noteCount = 12;
    const step = 2 * Math.PI / noteCount;
    for (let n = 0; n < noteCount; n++) {
      const bin = Math.floor(n * host.bufferLength / noteCount);
      const v = host.freqArray[bin] / 255;
      const angle = n * step - Math.PI / 2;
      const r = v * Math.min(w, h) * 0.4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      ctx.fillStyle = `hsl(${n / noteCount * 360}, 100%, 60%)`;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
});

// 6. VU-ring
catalogue.vu = (host, canvas) => ({
  draw() {
    host.analyser.getByteFrequencyData(host.freqArray);
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const v = host.freqArray.slice(0, 20).reduce((a, b) => a + b) / 20 / 255;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.4;
    ctx.lineWidth = 10; ctx.strokeStyle = `hsl(${120 - v * 120}, 100%, 50%)`;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * v); ctx.stroke();
  }
});

// 7. Fireflies (random dots sized by bass)
catalogue.fireflies = (host, canvas, { count = 30 } = {}) => {
  const flies = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), s: 0 }));
  return {
    draw() {
      host.analyser.getByteFrequencyData(host.freqArray);
      const ctx = canvas.getContext('2d');
      const { width: w, height: h } = canvas;
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, w, h);
      const bass = host.freqArray.slice(0, 4).reduce((a, b) => a + b) / 4 / 255;
      flies.forEach(f => {
        f.s = bass * (5 + Math.random() * 10);
        ctx.fillStyle = `hsl(${Math.random() * 60 + 120}, 100%, 60%)`;
        ctx.beginPath(); ctx.arc(f.x * w, f.y * h, f.s, 0, Math.PI * 2); ctx.fill();
      });
    }
  };
};

// 8. On-set flash
catalogue.flash = (host, canvas) => {
  let alpha = 0;
  return {
    draw() {
      host.analyser.getByteFrequencyData(host.freqArray);
      const ctx = canvas.getContext('2d');
      const { width: w, height: h } = canvas;
      const diff = host.freqArray[1] - host.freqArray[0]; // crude onset
      if (diff > 30) alpha = 1;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(0, 0, w, h);
      alpha *= 0.9;
    }
  };
};

// import { VizCatalogPlugin } from './viz_catalog_plugin.js';
//
// await daw.init();
// daw.register('viz', VizCatalogPlugin);
//
// const canvas = document.querySelector('canvas');
// const visual = daw.get('viz').use('circle', canvas); // swap name here
// requestAnimationFrame(function loop() {
//   visual.draw();
//   requestAnimationFrame(loop);
// });


