// state_machine_player_plugin.js
export class StateMachinePlayerPlugin {
  constructor(daw, opts = {}) {
    this.daw = daw;
    this._ctx = null;
    this._buffer = null;
    this._src = null;
    this._gainNode = null;

    this._state = 'EMPTY';          // public getter
    this._startTime = 0;            // ctx time at last play
    this._pauseTime = 0;            // accumulated seconds before pause
    this._duration = 0;
    this._gain = opts.gain ?? 1;

    this._cbs = [];                 // simple observer
  }

  /* ---------- life-cycle ---------- */
  async init() {
    this._ctx = this.daw.audioContext;
    this._gainNode = this._ctx.createGain();
    this._gainNode.gain.value = this._gain;
    this._notify();
  }

  get output() { return this._gainNode; } // for DAW wiring
  get state() { return this._state; }
  get currentTime() {
    if (this._state === 'PLAYING') {
      return this._ctx.currentTime - this._startTime + this._pauseTime;
    }
    return this._pauseTime;
  }
  get duration() { return this._duration; }

  /* ---------- commands ---------- */
  async load(urlOrArrayBuffer) {
    if (this._state !== 'EMPTY') this.stop();
    const buf = (urlOrArrayBuffer instanceof AudioBuffer)
      ? urlOrArrayBuffer
      : await this._fetchBuffer(urlOrArrayBuffer);
    this._buffer = buf;
    this._duration = buf.duration;
    return this._setState('LOADED');
  }

  play(offset = 0) {
    if (!this._buffer) return this._state;
    if (this._state === 'PLAYING') this.pause();
    if (this._state === 'ENDED') this._pauseTime = 0;

    this._src = this._ctx.createBufferSource();
    this._src.buffer = this._buffer;
    this._src.connect(this._gainNode);
    this._startTime = this._ctx.currentTime - offset;
    this._src.start(this._ctx.currentTime, offset);
    this._src.onended = () => this._onEnded();
    return this._setState('PLAYING');
  }

  pause() {
    if (this._state !== 'PLAYING') return this._state;
    this._src.stop();
    this._pauseTime += this._ctx.currentTime - this._startTime;
    this._src = null;
    return this._setState('PAUSED');
  }

  stop() {
    if (this._src) this._src.stop();
    this._src = null;
    this._pauseTime = 0;
    return this._setState('READY');
  }

  seek(seconds) {
    const was = this._state;
    if (was === 'PLAYING') this.pause();
    this._pauseTime = Math.max(0, Math.min(seconds, this._duration));
    return was === 'PLAYING' ? this.play(this._pauseTime) : this._state;
  }

  setGain(v) {
    this._gain = v;
    this._gainNode.gain.setTargetAtTime(v, this._ctx.currentTime, 0.01);
  }

  /* ---------- internal ---------- */
  _setState(s) {
    this._state = s;
    this._notify();
    return s;
  }
  _onEnded() {
    this._src = null;
    this._pauseTime = 0;
    this._setState('ENDED');
  }
  async _fetchBuffer(url) {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    return await this._ctx.decodeAudioData(ab);
  }
  _notify() {
    this._cbs.forEach(cb => cb(this._state, this));
  }

  /* ---------- observer ---------- */
  subscribe(fn) { this._cbs.push(fn); return () => (this._cbs = this._cbs.filter(f => f !== fn)); }
}

// const p = daw.register('player', AudioPlayerStatePlugin);
// await p.load('/loops/drum_break.wav');
//
// // UI buttons
// document.getElementById('play').onclick  = () => p.play();
// document.getElementById('pause').onclick = () => p.pause();
// document.getElementById('stop').onclick  = () => p.stop();
//
// // keep UI in sync
// p.subscribe((st, self) => console.log('state →', st, 'time', self.currentTime.toFixed(2)));
//
// // wire to master
// p.output.connect(daw.master.gain);
