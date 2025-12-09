// ========== Gammatone + VQT + Log-STFT + CFP Plugin ==========
// Ultra-light analytic implementations (no data files)
export class GammatoneVQTPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.order = options.order ?? 5;          // late in chain
    this.fftSize = 2048;
    this.hop = 512;
    this.melBands = 96;
    this.gammaOrder = 4;                      // gammatone filter order
    this.vqtQ = 34;                           // VQT Q-factor
    this.logStftBins = 84;                    // 84 bins / octave (piano range)
    this.cfpThresh = 0.005;                   // CFP peak-picking threshold
    this._node = null;                        // ScriptProcessorNode
    this._buffer = new Float32Array(this.fftSize);
    this._pos = 0;
  }

  async init() {
    const ctx = this.daw.audioContext;
    this._node = ctx.createScriptProcessor(256, 1, 1);
    this._node.onaudioprocess = (e) => this._process(e);
    this._node.connect(this.daw.master.gain);
    console.log('Gammatone+VQT+LogSTFT+CFP plugin ready');
  }

  _process(e) {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);

    // copy to circular buffer
    for (let i = 0; i < input.length; i++) {
      this._buffer[this._pos] = input[i];
      this._pos = (this._pos + 1) % this.fftSize;
      output[i] = input[i]; // thru
    }

    // run transforms every hop
    if (this._pos % this.hop === 0) {
      this._computeLogStft();
      this._computeGammatone();
      this._computeVQT();
      this._computeCFP();
    }
  }

  // ---------- 1. Log-frequency STFT ----------
  _computeLogStft() {
    const fft = this._rfft(this._buffer);
    const bins = [];
    const minF = 27.5; // A0
    const maxF = 4186; // C8
    const ratio = Math.pow(2, 1 / this.logStftBins);
    let f = minF;
    while (f < maxF) {
      const idx = Math.round((f / this.daw.sampleRate) * this.fftSize);
      bins.push(Math.hypot(fft[2 * idx], fft[2 * idx + 1]));
      f *= ratio;
    }
    this.logStft = bins; // expose to UI
  }

  // ---------- 2. Gammatone ----------
  _computeGammatone() {
    const cfs = this._erbSpace(80, 8000, this.melBands);
    const gamma = new Float32Array(this.melBands);
    for (let b = 0; b < this.melBands; b++) {
      const f = cfs[b];
      const bw = 1.019 * (24.7 + 0.108 * f); // ERB
      const phi = 2 * Math.PI * f / this.daw.sampleRate;
      const a = Math.exp(-bw / this.daw.sampleRate);
      let y = 0;
      for (let t = 0; t < this.fftSize; t++) {
        y += this._buffer[t] * Math.pow(t * phi, this.gammaOrder - 1) *
          Math.exp(-bw * t / this.daw.sampleRate) * Math.cos(phi * t);
      }
      gamma[b] = Math.abs(y);
    }
    this.gammatone = gamma;
  }

  // ---------- 3. VQT ----------
  _computeVQT() {
    const q = this.vqtQ;
    const vqt = [];
    for (let k = 1; k <= this.melBands; k++) {
      const f = 440 * Math.pow(2, (k - 49) / 12);
      const sigma = f / q;
      let sum = 0;
      for (let t = 0; t < this.fftSize; t++) {
        const window = Math.exp(-0.5 * Math.pow((t - this.fftSize / 2) /
          (this.daw.sampleRate / (2 * Math.PI * sigma)), 2));
        sum += this._buffer[t] * window * Math.cos(2 * Math.PI * f * t / this.daw.sampleRate);
      }
      vqt.push(Math.abs(sum));
    }
    this.vqt = vqt;
  }

  // ---------- 4. CFP ----------
  _computeCFP() {
    const stft = this.logStft;
    const cfp = new Array(stft.length).fill(0);
    for (let i = 1; i < stft.length - 1; i++) {
      if (stft[i] > this.cfpThresh &&
        stft[i] > stft[i - 1] && stft[i] > stft[i + 1]) {
        cfp[i] = stft[i];
      }
    }
    this.cfp = cfp;
  }

  // ---------- helpers ----------
  _rfft(signal) {
    // super-minimal real FFT via typed arrays
    const N = signal.length;
    const out = new Float32Array(2 * (N / 2 + 1));
    for (let k = 0; k <= N / 2; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const phi = -2 * Math.PI * k * n / N;
        re += signal[n] * Math.cos(phi);
        im += signal[n] * Math.sin(phi);
      }
      out[2 * k] = re;
      out[2 * k + 1] = im;
    }
    return out;
  }

  _erbSpace(low, high, num) {
    const ear_q = 9.26449;
    const min_bw = 24.7;
    const order = 1;
    const cf = new Float32Array(num);
    const lowErb = ear_q * Math.log(1 + low * order / (ear_q * min_bw));
    const highErb = ear_q * Math.log(1 + high * order / (ear_q * min_bw));
    for (let i = 0; i < num; i++) {
      const erb = lowErb + (highErb - lowErb) * i / (num - 1);
      cf[i] = (Math.exp(erb / ear_q) - 1) * ear_q * min_bw / order;
    }
    return cf;
  }

  destroy() {
    this._node.disconnect();
  }
}

// import { GammatoneVQTPlugin } from './gammatone_vqt_plugin.js';
// daw.register('gammatoneVQT', GammatoneVQTPlugin, { order: 6 });
//
// await daw.init();
// const gv = daw.get('gammatoneVQT');
// await gv.init();
// data now live in  gv.logStft  gv.gammatone  gv.vqt  gv.cfp
