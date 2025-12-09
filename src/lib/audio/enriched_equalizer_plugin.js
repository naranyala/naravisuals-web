
export class EnrichedEqualizerPlugin {
  constructor(daw, options = {}) {
    this.daw = daw;
    this.order = options.order ?? 2;

    // Per-band parameters with default values
    this.bands = [
      { type: 'lowshelf', freq: 120, Q: 0.7, gain: 0, label: 'Low' },
      { type: 'peaking', freq: 1000, Q: 1.0, gain: 0, label: 'Mid' },
      { type: 'highshelf', freq: 4000, Q: 0.7, gain: 0, label: 'High' }
    ];

    // Audio nodes
    this.input = null;
    this.filters = [];
    this.output = null;

    // State for Vue reactivity
    this.state = {
      showAdvanced: false,
      activePreset: 'flat'
    };
  }

  async init() {
    const ctx = this.daw.audioContext;

    // Create audio nodes
    this.input = ctx.createGain();
    this.output = ctx.createGain();

    // Create and configure filters
    this.bands.forEach(band => {
      const filter = ctx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.freq;
      filter.Q.value = band.Q;
      filter.gain.value = band.gain;
      this.filters.push(filter);
    });

    // Connect audio chain: input → filter1 → filter2 → filter3 → output
    let node = this.input;
    this.filters.forEach(filter => {
      node.connect(filter);
      node = filter;
    });
    node.connect(this.output);

    // Connect to DAW master
    this.output.connect(this.daw.master.gain);
  }

  // Public API methods for Vue component to call
  setGain(bandIndex, dB) {
    if (bandIndex < 0 || bandIndex >= this.bands.length) return;

    const band = this.bands[bandIndex];
    const gain = Math.max(-12, Math.min(12, dB));
    band.gain = gain;
    this.filters[bandIndex].gain.value = gain;
    this.state.activePreset = 'custom';

    this.dispatchStateChange();
  }

  setFrequency(bandIndex, frequency) {
    if (bandIndex < 0 || bandIndex >= this.bands.length) return;

    const band = this.bands[bandIndex];
    const freq = Math.max(20, Math.min(20000, frequency));
    band.freq = freq;
    this.filters[bandIndex].frequency.value = freq;
    this.state.activePreset = 'custom';

    this.dispatchStateChange();
  }

  setQ(bandIndex, q) {
    if (bandIndex < 0 || bandIndex >= this.bands.length) return;

    const band = this.bands[bandIndex];
    const qValue = Math.max(0.1, Math.min(30, q));
    band.Q = qValue;
    this.filters[bandIndex].Q.value = qValue;
    this.state.activePreset = 'custom';

    this.dispatchStateChange();
  }

  reset() {
    // Reset to default values
    this.bands = [
      { type: 'lowshelf', freq: 120, Q: 0.7, gain: 0, label: 'Low' },
      { type: 'peaking', freq: 1000, Q: 1.0, gain: 0, label: 'Mid' },
      { type: 'highshelf', freq: 4000, Q: 0.7, gain: 0, label: 'High' }
    ];

    this.applyBandValues();
    this.state.activePreset = 'flat';
    this.dispatchStateChange();
  }

  applyPreset(presetName) {
    const presets = {
      flat: [
        { gain: 0, freq: 120, Q: 0.7 },
        { gain: 0, freq: 1000, Q: 1.0 },
        { gain: 0, freq: 4000, Q: 0.7 }
      ],
      bassBoost: [
        { gain: 6, freq: 120, Q: 0.7 },
        { gain: 0, freq: 1000, Q: 1.0 },
        { gain: 0, freq: 4000, Q: 0.7 }
      ],
      trebleBoost: [
        { gain: 0, freq: 120, Q: 0.7 },
        { gain: 0, freq: 1000, Q: 1.0 },
        { gain: 6, freq: 4000, Q: 0.7 }
      ],
      vocal: [
        { gain: -2, freq: 120, Q: 0.7 },
        { gain: 3, freq: 1000, Q: 2.0 },
        { gain: 1, freq: 4000, Q: 0.7 }
      ],
      rock: [
        { gain: 4, freq: 120, Q: 0.7 },
        { gain: 2, freq: 800, Q: 1.5 },
        { gain: 4, freq: 4000, Q: 0.7 }
      ]
    };

    const preset = presets[presetName];
    if (!preset) return;

    preset.forEach((bandSettings, index) => {
      if (index < this.bands.length) {
        this.bands[index].gain = bandSettings.gain;
        this.bands[index].freq = bandSettings.freq;
        this.bands[index].Q = bandSettings.Q;

        this.filters[index].gain.value = bandSettings.gain;
        this.filters[index].frequency.value = bandSettings.freq;
        this.filters[index].Q.value = bandSettings.Q;
      }
    });

    this.state.activePreset = presetName;
    this.dispatchStateChange();
  }

  toggleAdvanced() {
    this.state.showAdvanced = !this.state.showAdvanced;
    this.dispatchStateChange();
  }

  // Getters for Vue component
  getBands() {
    return this.bands;
  }

  getState() {
    return { ...this.state };
  }

  getFrequencyResponse() {
    // Simulate frequency response for visualization
    const response = [];
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

    frequencies.forEach(freq => {
      let gain = 0;

      this.bands.forEach((band, index) => {
        const filter = this.filters[index];
        const gainAtFreq = this.calculateFilterGain(band.type, freq, band.freq, band.Q, band.gain);
        gain += gainAtFreq;
      });

      response.push({
        frequency: freq,
        gain: Math.max(-24, Math.min(24, gain))
      });
    });

    return response;
  }

  // Helper methods
  applyBandValues() {
    this.bands.forEach((band, index) => {
      const filter = this.filters[index];
      filter.frequency.value = band.freq;
      filter.Q.value = band.Q;
      filter.gain.value = band.gain;
    });
  }

  calculateFilterGain(type, frequency, centerFreq, Q, gain) {
    // Simplified filter gain calculation for visualization
    const octaves = Math.log2(frequency / centerFreq);

    switch (type) {
      case 'lowshelf':
        return frequency <= centerFreq ? gain : 0;
      case 'highshelf':
        return frequency >= centerFreq ? gain : 0;
      case 'peaking': {
        const bandwidth = 1 / Q;
        const normalizedFreq = Math.abs(octaves) / bandwidth;
        const attenuation = Math.exp(-2 * normalizedFreq * normalizedFreq);
        return gain * attenuation;
      }
      default:
        return 0;
    }
  }

  dispatchStateChange() {
    // Dispatch custom event for Vue component to listen to
    const event = new CustomEvent('eq-state-change', {
      detail: {
        bands: [...this.bands],
        state: { ...this.state }
      }
    });
    window.dispatchEvent(event);
  }

  // Audio graph connection points
  get inputNode() {
    return this.input;
  }

  get outputNode() {
    return this.output;
  }

  // Cleanup
  destroy() {
    if (this.input) this.input.disconnect();
    this.filters.forEach(filter => filter.disconnect());
    if (this.output) this.output.disconnect();
  }
}
