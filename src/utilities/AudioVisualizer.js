// Audio visualization and analysis
const AudioVisualizer = (() => {
  return class AudioVisualizer {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = {
        fftSize: 2048,
        smoothing: 0.8,
        color: '#4ecdc4',
        ...options
      };
      
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
      this.source = null;
      this.isPlaying = false;
    }

    async setup() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.options.fftSize;
        this.analyser.smoothingTimeConstant = this.options.smoothing;
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        return true;
      } catch (error) {
        console.error('Audio setup failed:', error);
        return false;
      }
    }

    async loadFromFile(file) {
      if (!this.audioContext) await this.setup();
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    async loadFromUrl(url) {
      if (!this.audioContext) await this.setup();
      
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    connectStream(stream) {
      if (!this.audioContext) this.setup();
      
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
    }

    start() {
      if (this.source && !this.isPlaying) {
        this.source.start();
        this.isPlaying = true;
        this.visualize();
      }
    }

    stop() {
      if (this.source) {
        this.source.stop();
        this.isPlaying = false;
      }
    }

    visualize() {
      if (!this.isPlaying) return;

      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      this.analyser.getByteFrequencyData(this.dataArray);

      const barWidth = (width / this.dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * height;

        this.ctx.fillStyle = this.options.color;
        this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      requestAnimationFrame(() => this.visualize());
    }

    visualizeWaveform() {
      if (!this.isPlaying) return;

      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      this.analyser.getByteTimeDomainData(this.dataArray);

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.options.color;
      this.ctx.beginPath();

      const sliceWidth = width / this.dataArray.length;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      this.ctx.lineTo(width, height / 2);
      this.ctx.stroke();

      requestAnimationFrame(() => this.visualizeWaveform());
    }

    getVolume() {
      if (!this.dataArray) return 0;
      
      let sum = 0;
      for (const value of this.dataArray) {
        sum += value;
      }
      return sum / this.dataArray.length / 255;
    }

    // Utility methods
    setColor(color) {
      this.options.color = color;
    }

    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    destroy() {
      this.stop();
      if (this.audioContext) {
        this.audioContext.close();
      }
    }
  };
})();
