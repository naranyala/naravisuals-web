// pitch_detection_plugin.js
// Ultra-lightweight pitch-detection for daw_core
// Usage: const f0 = await daw.get('pitch').getPitch(someBuffer);

export class PitchDetectionPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.minFreq = options.minFreq ?? 80;   // Hz
    this.maxFreq = options.maxFreq ?? 1200; // Hz
  }

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------
  async getPitch(audioBuffer, options = {}) {
    const channel = options.channel ?? 0;
    const data = audioBuffer.getChannelData(channel);
    const sampleRate = audioBuffer.sampleRate;

    const minLag = Math.floor(sampleRate / (options.maxFreq ?? this.maxFreq));
    const maxLag = Math.floor(sampleRate / (options.minFreq ?? this.minFreq));

    const autocorr = this.#normalizedAutocorrelation(data);
    let bestLag = 0;
    let bestValue = -Infinity;

    // Find highest peak in the valid lag range
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (autocorr[lag] > bestValue) {
        bestValue = autocorr[lag];
        bestLag = lag;
      }
    }

    return bestLag ? sampleRate / bestLag : null; // null = no pitch found
  }

  // ------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------
  #normalizedAutocorrelation(signal) {
    const len = signal.length;
    const r = new Float32Array(len);

    // Mean normalization
    let mean = 0;
    for (let i = 0; i < len; i++) mean += signal[i];
    mean /= len;

    // Compute autocorrelation
    for (let lag = 0; lag < len; lag++) {
      let num = 0,
        denL = 0,
        denR = 0;
      for (i = 0; i < len - lag; i++) {
        const x = signal[i] - mean;
        const y = signal[i + lag] - mean;
        num += x * y;
        denL += x * x;
        denR += y * y;
      }
      r[lag] = denL && denR ? num / Math.sqrt(denL * denR) : 0;
    }
    return r;
  }
}

// import { PitchDetectionPlugin } from './pitch_detection_plugin.js';
//
// daw.register('pitch', PitchDetectionPlugin, { minFreq: 60, maxFreq: 1500 });
//
// // later…
// const buf = someAudioBuffer;
// const fundamental = await daw.get('pitch').getPitch(buf);
// console.log('Detected pitch:', fundamental?.toFixed(2), 'Hz');
