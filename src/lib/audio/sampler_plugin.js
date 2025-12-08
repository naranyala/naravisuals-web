export class SamplerPlugin {
    constructor(daw) {
        this.daw = daw;
        this.activeSources = new WeakMap(); // track → Set<source>
    }

    async loadBuffer(urlOrFile) {
        await this.daw.init();
        const arrayBuffer = await (typeof urlOrFile === 'string'
            ? fetch(urlOrFile).then(r => r.arrayBuffer())
            : urlOrFile.arrayBuffer());
        return this.daw.audioContext.decodeAudioData(arrayBuffer);
    }

    scheduleClip(trackId, buffer, when, offset = 0, duration = null) {
        const tracks = this.daw.get('tracks');
        const track = tracks?.get(trackId);
        if (!track) return;

        const source = this.daw.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(track.gain);

        if (duration) source.start(when, offset, duration);
        else source.start(when, offset);

        // Auto cleanup
        source.onended = () => {
            const set = this.activeSources.get(track) || new Set();
            set.delete(source);
        };

        let set = this.activeSources.get(track);
        if (!set) {
            set = new Set();
            this.activeSources.set(track, set);
        }
        set.add(source);

        return source;
    }

    stopAllOnTrack(trackId) {
        const set = this.activeSources.get(this.daw.get('tracks').get(trackId));
        if (set) set.forEach(s => s.stop());
    }
}
