// main.js
import daw from './daw_core.js';
import { TransportPlugin } from './plugins/transport.js';
import { TracksPlugin } from './plugins/tracks.js';
import { SamplerPlugin } from './plugins/sampler.js';
import { RendererPlugin } from './plugins/renderer.js';

await daw.init();

// Register plugins
daw.register('transport', TransportPlugin);
daw.register('tracks', TracksPlugin);
daw.register('sampler', SamplerPlugin);
daw.register('renderer', RendererPlugin);

// Use it!
const tracks = daw.get('tracks');
const transport = daw.get('transport');
const sampler = daw.get('sampler');

const track1 = tracks.createTrack('drums');
const buffer = await sampler.loadBuffer('kick.wav');

tracks.get('track1').clips.push({
    buffer,
    startTime: 0,
    offset: 0,
    duration: buffer.duration
});

transport.play(); // plays all scheduled clips
