
// ========== Audio Player Plugin ==========
export class AudioPlayerPlugin {
  constructor(daw) {
    this.daw = daw;
    this.source = null;
    this.buffer = null;
    this.startTime = 0;
    this.pauseTime = 0;
    this.isPlaying = false;
  }

  async loadFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.daw.audioContext.decodeAudioData(arrayBuffer);
    this.pauseTime = 0;
  }

  play() {
    if (this.isPlaying || !this.buffer) return;
    this.source = this.daw.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.daw.master.gain);
    this.startTime = this.daw.audioContext.currentTime - this.pauseTime;
    this.source.start(0, this.pauseTime);
    this.isPlaying = true;
    this.source.onended = () => {
      this.isPlaying = false;
      this.pauseTime = 0;
    };
  }

  pause() {
    if (!this.isPlaying) return;
    this.source?.stop();
    this.pauseTime = this.daw.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
  }

  stop() {
    this.source?.stop();
    this.pauseTime = 0;
    this.isPlaying = false;
  }

  getCurrentTime() {
    return this.isPlaying
      ? this.daw.audioContext.currentTime - this.startTime
      : this.pauseTime;
  }

  getDuration() {
    return this.buffer?.duration || 0;
  }
}
