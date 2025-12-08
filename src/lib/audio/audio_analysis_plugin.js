// audio_analysis_plugin.js
export class AudioAnalysisPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.fftSize = options.fftSize || 2048;
    this.smoothing = options.smoothing || 0.7; // 0 = no smoothing
    this.bufferLength = this.fftSize / 2;

    // Per-track storage
    this.trackMeters = new Map(); // trackId → { analyser, gain, ... }

    // Public API for whoever wants to listen
    this.callbacks = [];
  }

  /* ---------- life-cycle ---------- */
  async onTrackAdded(track) {
    const ctx = this.daw.audioContext;
    if (!ctx) return;

    // Create a tiny analysis sub-graph
    const analyser = ctx.createAnalyser();
    analyser.fftSize = this.fftSize;
    analyser.smoothingTimeConstant = this.smoothing;

    const gain = ctx.createGain(); // dummy, just to keep graph happy
    gain.gain.value = 1;

    // Wire: track → analyser → gain → nothing (will be connected by DAW)
    track.output.connect(analyser);
    analyser.connect(gain);

    this.trackMeters.set(track.id, {
      analyser,
      gain,
      rms: 0,
      peak: 0,
      spectrum: new Float32Array(this.bufferLength)
    });
  }

  async onTrackRemoved(track) {
    const m = this.trackMeters.get(track.id);
    if (m) {
      m.analyser.disconnect();
      m.gain.disconnect();
      this.trackMeters.delete(track.id);
    }
  }

  /* ---------- metering loop ---------- */
  start() {
    if (this._timer) return;
    this._timer = setInterval(() => this._update(), 50); // 20 fps
  }

  stop() {
    clearInterval(this._timer);
    this._timer = null;
  }

  _update() {
    const report = {};
    this.trackMeters.forEach((m, id) => {
      const wave = new Float32Array(this.bufferLength);
      const freq = new Float32Array(this.bufferLength);
      m.analyser.getFloatTimeDomainData(wave);
      m.analyser.getFloatFrequencyData(freq);

      // RMS & peak
      let rms = 0, peak = 0;
      for (let s of wave) {
        peak = Math.max(peak, Math.abs(s));
        rms += s * s;
      }
      rms = Math.sqrt(rms / wave.length);

      m.rms = rms;
      m.peak = peak;
      m.spectrum = freq;

      report[id] = { rms, peak, spectrum: freq.slice() };
    });

    // fire event
    this.callbacks.forEach(cb => cb(report));
  }

  /* ---------- public helpers ---------- */
  subscribe(fn) {
    this.callbacks.push(fn);
    return () => (this.callbacks = this.callbacks.filter(f => f !== fn));
  }

  getMeter(trackId) {
    return this.trackMeters.get(trackId);
  }
}

// daw.register('analyser', AudioAnalysisPlugin, { fftSize: 2048 });
//
// // Start the meter loop
// daw.get('analyser').start();
//
// // Draw a simple level meter for track-0
// const unsub = daw.get('analyser').subscribe(report => {
//   const m = report[0]; // first track
//   const db = 20 * Math.log10(m.rms + 1e-6);
//   console.log(`RMS: ${db.toFixed(1)} dB`);
// });
