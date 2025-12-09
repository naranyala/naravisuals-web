// another_processing_plugin.js


export class AnotherProcessingPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.order = options.order ?? 3;
    this.n_fft = options.n_fft ?? 2048;
    this.win_length = options.win_length ?? this.n_fft;
    this.hop_length = options.hop_length ?? 512;
    this.power = options.power ?? 2;
    this.normalized = options.normalized ?? false;
    this.center = options.center ?? true;
    this.window = options.window ?? 'hann';
    this.onesided = true;
    this._node = null;
    this._inBuffer = new Float32Array(this.n_fft);
    this._pos = 0;
    this._windowFn = this._makeWindow();
    this._out = null;
  }

  async init() {
    const ctx = this.daw.audioContext;
    this._node = ctx.createScriptProcessor(256, 1, 1);
    this._node.onaudioprocess = (e) => this._process(e);
    this._node.connect(this.daw.master.gain);
  }

  set(param, value) {
    if (param in this) {
      this[param] = value;
      if (param === 'n_fft' || param === 'win_length') {
        this._inBuffer = new Float32Array(this.n_fft);
        this._windowFn = this._makeWindow();
      }
    }
  }

  get spectrogram() { return this._out; }

  _process(e) {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
      this._inBuffer[this._pos] = input[i];
      this._pos = (this._pos + 1) % this.n_fft;
      if (this._pos % this.hop_length === 0) this._out = this._stft();
    }
  }

  _stft() {
    const N = this.n_fft;
    const half = N / 2 + 1;
    const spec = new Float32Array(half);
    const frame = new Float32Array(N);
    const offset = this.center ? N / 2 : 0;
    for (let i = 0; i < N; i++) {
      const idx = (this._pos + i - offset + N) % N;
      frame[i] = this._inBuffer[idx] * this._windowFn[i];
    }
    const fft = this._rfft(frame);
    for (let k = 0; k < half; k++) {
      const re = fft[2 * k], im = fft[2 * k + 1];
      const val = (re * re + im * im) / N;
      spec[k] = this.power === 1 ? Math.sqrt(val) : val;
    }
    if (this.normalized) {
      const norm = spec.reduce((a, b) => a + b, 0) || 1;
      spec.forEach((v, i) => spec[i] = v / norm);
    }
    return spec;
  }

  _makeWindow() {
    const N = this.n_fft, w = new Float32Array(N);
    for (let n = 0; n < N; n++) {
      switch (this.window) {
        case 'hann':
          w[n] = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1)); break;
        case 'hamming':
          w[n] = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1)); break;
        case 'blackman':
          w[n] = 0.42 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1)) +
            0.08 * Math.cos(4 * Math.PI * n / (N - 1)); break;
        default: w[n] = 1;
      }
    }
    return w;
  }

  _rfft(signal) {
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

  destroy() { this._node.disconnect(); }
}
