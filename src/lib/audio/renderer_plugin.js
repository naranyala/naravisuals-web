export class RendererPlugin {
    async renderToWAV(durationSeconds, sampleRate = 48000) {
        const offline = new OfflineAudioContext(2, durationSeconds * sampleRate, sampleRate);

        // Rebuild entire graph
        const master = offline.createGain();
        master.connect(offline.destination);

        const tracks = this.daw.get('tracks');
        tracks.tracks.forEach(track => {
            const gain = offline.createGain();
            gain.gain.value = track.volume;
            gain.connect(master);

            track.clips.forEach(clip => {
                const src = offline.createBufferSource();
                src.buffer = clip.buffer;
                src.connect(gain);
                src.start(clip.startTime, clip.offset, clip.duration);
            });
        });

        const buffer = await offline.startRendering();
        return this.audioBufferToWavBlob(buffer);
    }

    audioBufferToWavBlob(buffer) {
        // Same robust function from before, but now with correct interleaving
        const interleaved = new Float32Array(buffer.length * buffer.numberOfChannels);
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                interleaved[i * buffer.numberOfChannels + ch] = data[i];
            }
        }
        return encodeWAV(interleaved, buffer.sampleRate); // use a tiny pure-js WAV encoder
    }
}
