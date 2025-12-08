// daw_core.js - Ultra-lightweight Plugin-Based DAW Core (2025)
// ≈ 150 LOC, fully extensible

class DAWCore {
    constructor() {
        this.audioContext = null;
        this.plugins = new Map();        // name → plugin instance
        this.pluginOrder = [];           // execution order for audio graph
        this.master = null;
        this.sampleRate = 44100;
        this.isInitialized = false;
    }

    async init(options = {}) {
        if (this.isInitialized) return this.audioContext;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new (options.OfflineAudioContext || AudioContext)({
            latencyHint: 'interactive',
            sampleRate: options.sampleRate
        });

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.sampleRate = this.audioContext.sampleRate;

        // Master output chain
        this.master = {
            gain: this.audioContext.createGain(),
            analyser: this.audioContext.createAnalyser(),
            destination: this.audioContext.destination
        };
        this.master.gain.gain.value = 0.8;
        this.master.analyser.fftSize = 2048;
        this.master.gain.connect(this.master.analyser);
        this.master.analyser.connect(this.master.destination);

        this.isInitialized = true;
        console.log(`DAWCore initialized @ ${this.sampleRate}Hz`);
        return this.audioContext;
    }

    // ====================== PLUGIN SYSTEM ======================
    register(name, pluginClass, options = {}) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin ${name} already registered, overwriting.`);
        }
        const instance = new pluginClass(this, options);
        this.plugins.set(name, instance);
        if (instance.order !== undefined) {
            this.pluginOrder[instance.order] = name;
        }
        console.log(`Plugin registered: ${name}`);
        return instance;
    }

    get(name) {
        return this.plugins.get(name);
    }

    async call(method, ...args) {
        for (const name of this.plugins.keys()) {
            const plugin = this.plugins.get(name);
            if (typeof plugin[method] === 'function') {
                await plugin[method](...args);
            }
        }
    }

    // Helper to connect plugins in order
    reconnectGraph() {
        let node = null;
        const ordered = this.pluginOrder.filter(Boolean);

        for (const name of ordered) {
            const plugin = this.plugins.get(name);
            if (plugin.output) {
                if (node) node.disconnect();
                node = plugin.output;
            }
        }

        if (node) {
            node.disconnect();
            node.connect(this.master.gain);
        }
    }
}

// Global singleton (or you can instantiate multiple)
const daw = new DAWCore();
export default daw;
