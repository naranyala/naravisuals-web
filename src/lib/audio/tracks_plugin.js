export class TracksPlugin {
    order = 100;
    constructor(daw) {
        this.daw = daw;
        this.tracks = new Map();
        this.output = this.daw.audioContext.createGain();
        this.output.connect(this.daw.master.gain);
    }

    createTrack(id = crypto.randomUUID(), config = {}) {
        const track = {
            id,
            name: config.name || "Track",
            gain: this.daw.audioContext.createGain(),
            pan: this.daw.audioContext.createStereoPanner(),
            analyser: this.daw.audioContext.createAnalyser(),
            clips: new Set(), // use Set for faster lookup
            volume: 0.8,
            panValue: 0,
            muted: false,
            solo: false,
            color: config.color || randomColor(),
        };

        track.gain.gain.value = track.volume;
        track.pan.pan.value = track.panValue;
        track.gain.connect(track.pan).connect(track.analyser).connect(this.output);

        this.tracks.set(id, track);
        return track;
    }

    // Called by TransportPlugin every frame
    scheduleAhead(currentTime, lookAhead) {
        this.tracks.forEach(track => {
            track.clips.forEach(clip => {
                const { startTime, whenScheduled } = clip;
                if (startTime >= currentTime && startTime < currentTime + lookAhead && !whenScheduled) {
                    const when = this.daw.audioContext.currentTime + (startTime - currentTime);
                    this.daw.get('sampler')?.scheduleClip(track.id, clip.buffer, when, clip.offset, clip.duration);
                    clip.whenScheduled = when;
                }
            });
        });
    }

    addClip(trackId, buffer, startTime = 0, offset = 0, duration = null) {
        const clip = {
            id: crypto.randomUUID(),
            buffer,
            startTime,
            offset,
            duration: duration ?? buffer.duration - offset,
            whenScheduled: null,
        };
        track.clips.add(clip);
        return clip;
    }
}
