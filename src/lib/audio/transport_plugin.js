export class TransportPlugin {
    order = -999; // Run first
    constructor(daw, options = {}) {
        this.daw = daw;
        this.bpm = options.bpm || 120;
        this.isPlaying = false;
        this.currentTime = 0;
        this.startTime = 0;
        this.lookAhead = 0.1;
        this.scheduleId = null;
    }

    play() {
        if (this.isPlaying) return;
        return this.daw.init().then(() => {
            this.isPlaying = true;
            this.startTime = this.daw.audioContext.currentTime - this.currentTime;
            this._schedule();
            this.daw.call('onTransportPlay');
        });
    }

    pause() {
        this.isPlaying = false;
        cancelAnimationFrame(this.scheduleId);
        this.currentTime = this.daw.audioContext.currentTime - this.startTime;
        this.daw.call('onTransportPause');
    }

    stop() {
        this.pause();
        this.currentTime = 0;
        this.startTime = 0;
        this.daw.call('onTransportStop');
    }

    seek(seconds) {
        const wasPlaying = this.isPlaying;
        this.stop();
        this.currentTime = Math.max(0, seconds);
        if (wasPlaying) this.play();
    }

    getCurrentTime() {
        if (!this.isPlaying) return this.currentTime;
        return this.daw.audioContext.currentTime - this.startTime;
    }

    // Private scheduler
    _schedule() {
        const current = this.getCurrentTime();
        this.daw.call('scheduleAhead', current, this.lookAhead);
        this.scheduleId = requestAnimationFrame(() => this._schedule());
    }
}
