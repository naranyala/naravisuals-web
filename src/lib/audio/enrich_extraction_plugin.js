/**
 * EnrichExtractionPlugin - Stream-Based Feature Extraction
 * 
 * Modern implementation using:
 * - Web Audio API native analyzers
 * - Streaming feature computation
 * - Adaptive frame rates
 * 
 * Features extracted:
 * - Energy (RMS, Peak, Crest Factor)
 * - Spectral (Centroid, Spread, Rolloff, Flux)
 * - Temporal (ZCR, Onset, Beat Phase)
 * - Perceptual (Loudness, Brightness, Roughness)
 * - Timbre (MFCC x13)
 */

export class EnrichExtractionPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.order = options.order ?? 1;

    // Configuration
    this.config = {
      fftSize: options.fftSize ?? 4096,
      smoothing: options.smoothing ?? 0.8,
      frameRate: options.frameRate ?? 20, // Hz
      bpm: options.bpm ?? 120,
      onsetSensitivity: options.onsetSensitivity ?? 0.3
    };

    // Audio graph
    this.nodes = {
      input: null,
      splitter: null,
      analyzer: null,
      output: null
    };

    // Feature extractors
    this.extractors = {
      spectral: null,
      temporal: null,
      perceptual: null,
      mfcc: null
    };

    // State
    this.state = {
      isRunning: false,
      frameId: null,
      lastFrameTime: 0,
      phase: 0,
      previousSpectrum: null
    };

    // Feature cache
    this.features = this._getEmptyFeatures();

    // Event system
    this.listeners = new Map();
  }

  // ==================== LIFECYCLE ====================

  async init() {
    const ctx = this.daw.audioContext;

    // Build audio graph
    this.nodes.input = ctx.createGain();
    this.nodes.output = ctx.createGain();
    this.nodes.analyzer = ctx.createAnalyser();
    this.nodes.splitter = ctx.createChannelSplitter(2);

    // Configure analyzer
    this.nodes.analyzer.fftSize = this.config.fftSize;
    this.nodes.analyzer.smoothingTimeConstant = this.config.smoothing;
    this.nodes.analyzer.minDecibels = -90;
    this.nodes.analyzer.maxDecibels = -10;

    // Connect: input -> analyzer -> output
    //                  -> splitter (for analysis)
    this.nodes.input.connect(this.nodes.analyzer);
    this.nodes.analyzer.connect(this.nodes.output);
    this.nodes.input.connect(this.nodes.splitter);

    // Initialize extractors
    this._initExtractors(ctx);

    // Start extraction loop
    this.start();

    console.log('EnrichExtractionPlugin initialized (stream-based)');
    return ctx;
  }

  start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this._extractionLoop();
  }

  stop() {
    this.state.isRunning = false;
    if (this.state.frameId) {
      cancelAnimationFrame(this.state.frameId);
      this.state.frameId = null;
    }
  }

  destroy() {
    this.stop();

    Object.values(this.nodes).forEach(node => {
      if (node) node.disconnect();
    });

    this.listeners.clear();
  }

  // ==================== AUDIO GRAPH ====================

  get input() { return this.nodes.input; }
  get output() { return this.nodes.output; }

  // ==================== CONFIGURATION ====================

  setBPM(bpm) {
    this.config.bpm = Math.max(20, Math.min(300, bpm));
    this.emit('config:change', { bpm: this.config.bpm });
  }

  setFrameRate(hz) {
    this.config.frameRate = Math.max(1, Math.min(60, hz));
  }

  setSensitivity(value) {
    this.config.onsetSensitivity = Math.max(0, Math.min(1, value));
  }

  // ==================== EVENT SYSTEM ====================

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try { cb(data, this); }
      catch (err) { console.error('Listener error:', err); }
    });
  }

  // Backward compatibility
  subscribe(callback) {
    return this.on('features', callback);
  }

  // ==================== EXTRACTION LOOP ====================

  _extractionLoop() {
    if (!this.state.isRunning) return;

    const now = performance.now();
    const frameInterval = 1000 / this.config.frameRate;

    if (now - this.state.lastFrameTime >= frameInterval) {
      this.state.lastFrameTime = now;
      this._extractFeatures();
    }

    this.state.frameId = requestAnimationFrame(() => this._extractionLoop());
  }

  _extractFeatures() {
    const analyzer = this.nodes.analyzer;
    const bufferLength = analyzer.frequencyBinCount;

    // Get raw data
    const timeData = new Float32Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    analyzer.getFloatTimeDomainData(timeData);
    analyzer.getByteFrequencyData(freqData);

    // Convert frequency data to normalized spectrum
    const spectrum = new Float32Array(bufferLength);
    for (let i = 0; i < bufferLength; i++) {
      spectrum[i] = freqData[i] / 255;
    }

    // Extract all features
    const features = {
      timestamp: this.daw.audioContext.currentTime,

      // Energy features
      ...this.extractors.temporal.extract(timeData),

      // Spectral features
      ...this.extractors.spectral.extract(spectrum, this.state.previousSpectrum),

      // Perceptual features
      ...this.extractors.perceptual.extract(spectrum, timeData),

      // MFCC
      mfcc: this.extractors.mfcc.extract(spectrum),

      // Phase
      phase: this._updatePhase()
    };

    // Store spectrum for next frame
    this.state.previousSpectrum = spectrum;

    // Update and emit
    Object.assign(this.features, features);
    this.emit('features', this.features);
  }

  // ==================== FEATURE EXTRACTORS ====================

  _initExtractors(ctx) {
    const sampleRate = ctx.sampleRate;
    const fftSize = this.config.fftSize;
    const bufferLength = fftSize / 2;

    // Temporal extractor
    this.extractors.temporal = {
      previousPeak: 0,
      extract: (timeData) => {
        let rms = 0, peak = 0, zcr = 0;

        for (let i = 0; i < timeData.length; i++) {
          const sample = timeData[i];
          rms += sample * sample;
          peak = Math.max(peak, Math.abs(sample));

          if (i > 0 && timeData[i - 1] * sample < 0) {
            zcr++;
          }
        }

        rms = Math.sqrt(rms / timeData.length);
        zcr = zcr / timeData.length;

        // Onset detection
        const onset = (peak - this.extractors.temporal.previousPeak) >
          this.config.onsetSensitivity;
        this.extractors.temporal.previousPeak = peak * 0.95;

        const crestFactor = peak > 0 ? peak / (rms + 1e-6) : 0;

        return { rms, peak, onset, zcr, crestFactor };
      }
    };

    // Spectral extractor
    this.extractors.spectral = {
      extract: (spectrum, prevSpectrum) => {
        const binWidth = sampleRate / fftSize;
        let centroid = 0, spread = 0, rolloff = 0, flux = 0;
        let sumMag = 0, sumWeighted = 0;

        // Centroid and weighted sum
        for (let i = 0; i < spectrum.length; i++) {
          const freq = i * binWidth;
          const mag = spectrum[i];
          sumMag += mag;
          sumWeighted += freq * mag;
        }

        centroid = sumMag > 0 ? sumWeighted / sumMag : 0;

        // Spread (spectral variance)
        for (let i = 0; i < spectrum.length; i++) {
          const freq = i * binWidth;
          const diff = freq - centroid;
          spread += diff * diff * spectrum[i];
        }
        spread = sumMag > 0 ? Math.sqrt(spread / sumMag) : 0;

        // Rolloff (95% energy point)
        const threshold = sumMag * 0.95;
        let accumulator = 0;
        for (let i = 0; i < spectrum.length; i++) {
          accumulator += spectrum[i];
          if (accumulator >= threshold) {
            rolloff = i * binWidth;
            break;
          }
        }

        // Spectral flux
        if (prevSpectrum) {
          for (let i = 0; i < spectrum.length; i++) {
            const diff = spectrum[i] - prevSpectrum[i];
            flux += diff * diff;
          }
          flux = Math.sqrt(flux / spectrum.length);
        }

        return { centroid, spread, rolloff, flux };
      }
    };

    // Perceptual extractor
    this.extractors.perceptual = {
      aWeights: null,

      getAWeights: function(length, sr, fftSize) {
        if (this.aWeights) return this.aWeights;

        const weights = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          const f = i * sr / fftSize;
          const f2 = f * f;
          const num = 12194 * 12194 * f2 * f2;
          const den = (f2 + 20.6 * 20.6) *
            Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) *
            (f2 + 12194 * 12194);
          weights[i] = den > 0 ? num / den : 0;
        }
        this.aWeights = weights;
        return weights;
      },

      extract: function(spectrum, timeData) {
        // Loudness (A-weighted approximation)
        let loudness = 0;
        const aWeights = this.getAWeights(spectrum.length, sampleRate, fftSize);
        for (let i = 0; i < spectrum.length; i++) {
          loudness += spectrum[i] * aWeights[i];
        }
        loudness = Math.sqrt(loudness / spectrum.length);

        // Brightness (energy above 1.5kHz)
        const brightnessBin = Math.floor(1500 / (sampleRate / fftSize));
        let brightness = 0;
        for (let i = brightnessBin; i < spectrum.length; i++) {
          brightness += spectrum[i];
        }
        brightness = brightness / (spectrum.length - brightnessBin);

        // Roughness (simplified - beating frequencies)
        let roughness = 0;
        for (let i = 1; i < 50 && i < spectrum.length; i++) {
          roughness += Math.abs(spectrum[i] - spectrum[i - 1]);
        }
        roughness = roughness / 50;

        return { loudness, brightness, roughness };
      }
    };

    // MFCC extractor
    this.extractors.mfcc = {
      numCoeffs: 13,
      melFilters: null,

      createMelFilterbank: function(numFilters, fftBins, sr, fftSize) {
        if (this.melFilters) return this.melFilters;

        const minMel = 2595 * Math.log10(1 + 80 / 700);
        const maxMel = 2595 * Math.log10(1 + (sr / 2) / 700);
        const melPoints = new Float32Array(numFilters + 2);

        for (let i = 0; i < numFilters + 2; i++) {
          const mel = minMel + (maxMel - minMel) * i / (numFilters + 1);
          const hz = 700 * (Math.pow(10, mel / 2595) - 1);
          melPoints[i] = Math.floor(hz * fftSize / sr);
        }

        const filters = [];
        for (let m = 0; m < numFilters; m++) {
          const filter = new Float32Array(fftBins);
          const left = melPoints[m];
          const center = melPoints[m + 1];
          const right = melPoints[m + 2];

          for (let i = 0; i < fftBins; i++) {
            if (i >= left && i <= center) {
              filter[i] = (i - left) / (center - left);
            } else if (i >= center && i <= right) {
              filter[i] = (right - i) / (right - center);
            }
          }
          filters.push(filter);
        }

        this.melFilters = filters;
        return filters;
      },

      extract: function(spectrum) {
        // Initialize filterbank if needed
        const filters = this.createMelFilterbank(13, spectrum.length, sampleRate, fftSize);

        const mfcc = new Float32Array(13);

        // Apply mel filterbank
        const melSpectrum = new Float32Array(13);
        for (let m = 0; m < 13; m++) {
          let sum = 0;
          for (let i = 0; i < spectrum.length; i++) {
            sum += spectrum[i] * filters[m][i];
          }
          melSpectrum[m] = Math.log(Math.max(sum, 1e-10));
        }

        // DCT
        for (let i = 0; i < 13; i++) {
          let sum = 0;
          for (let j = 0; j < 13; j++) {
            sum += melSpectrum[j] * Math.cos(Math.PI * i * (j + 0.5) / 13);
          }
          mfcc[i] = sum;
        }

        return mfcc;
      }
    };
  }

  _updatePhase() {
    const ctx = this.daw.audioContext;
    const frameDuration = 1 / this.config.frameRate;
    const beatDuration = 60 / this.config.bpm;
    this.state.phase = (this.state.phase + frameDuration / beatDuration) % 1;
    return this.state.phase;
  }

  _getEmptyFeatures() {
    return {
      timestamp: 0,
      rms: 0,
      peak: 0,
      onset: false,
      zcr: 0,
      crestFactor: 0,
      centroid: 0,
      spread: 0,
      rolloff: 0,
      flux: 0,
      loudness: 0,
      brightness: 0,
      roughness: 0,
      mfcc: new Float32Array(13),
      phase: 0
    };
  }
}
