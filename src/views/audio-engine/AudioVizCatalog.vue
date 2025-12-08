<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import daw from '../../lib/audio/daw_core.js';
import { VizCatalogPlugin } from '../../lib/audio/viz_catalog_plugin.js';
// import { VizWebglPlugin } from '../../lib/audio/viz_webgl_plugin.js';
import { AudioPlayerPlugin } from '../../lib/audio/audio_player_plugin.js';


// ========== Vue Component State ==========
const canvas = ref(null);
const fileInput = ref(null);
const fileName = ref('');
const isPlaying = ref(false);
const vizType = ref('bars');
const currentTime = ref(0);
const duration = ref(0);

let player = null;
let animFrame = null;
let visual = null;

onMounted(async () => {
  await daw.init();
  daw.register('viz', VizCatalogPlugin);
  // daw.register('viz', VizWebglPlugin);

  daw.register('player', AudioPlayerPlugin);
  player = daw.get('player');
  startAnimation();
});

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
});

watch(vizType, () => {
  if (animFrame) cancelAnimationFrame(animFrame);
  startAnimation();
});

function startAnimation() {
  if (!canvas.value) return;
  const vizPlugin = daw.get('viz');
  visual = vizPlugin.use(vizType.value, canvas.value);
  
  const animate = () => {
    visual.draw();
    if (player && isPlaying.value) {
      currentTime.value = player.getCurrentTime();
    }
    animFrame = requestAnimationFrame(animate);
  };
  animate();
}

async function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  fileName.value = file.name;
  await player.loadFile(file);
  duration.value = player.getDuration();
  currentTime.value = 0;
}

function togglePlay() {
  if (!player?.buffer) return;
  if (isPlaying.value) {
    player.pause();
    isPlaying.value = false;
  } else {
    player.play();
    isPlaying.value = true;
  }
}

function handleStop() {
  player?.stop();
  isPlaying.value = false;
  currentTime.value = 0;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const progress = computed(() => 
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
);
</script>

<template>
  <div class="player">
    <h1>Audio Visualizer</h1>
    <canvas ref="canvas" width="800" height="300"></canvas>
    
    <input 
      ref="fileInput" 
      type="file" 
      accept="audio/*" 
      @change="handleFileChange" 
      style="display:none"
    />
    
    <button @click="fileInput.click()" class="file-btn">
      {{ fileName || 'Choose Audio File' }}
    </button>
    
    <template v-if="fileName">
      <div class="progress-bar">
        <span>{{ formatTime(currentTime) }}</span>
        <div class="bar">
          <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span>{{ formatTime(duration) }}</span>
      </div>
      
      <div class="controls">
        <button @click="togglePlay" class="play-btn">
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        <button @click="handleStop" class="stop-btn">Stop</button>
      </div>
      
      <select v-model="vizType" class="viz-select">
        <option value="bars">Frequency Bars</option>
        <option value="circle">Radial Circle</option>
        <option value="wave">Waveform</option>
        <option value="stereo">Stereo Scope</option>
        <option value="notes">Note Wheel</option>
        <option value="vu">VU Ring</option>
        <option value="fireflies">Fireflies</option>
        <option value="flash">Flash</option>
      </select>
    </template>
  </div>
</template>

<style scoped>
.player {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

h1 {
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  background: linear-gradient(90deg, #a78bfa, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

canvas {
  width: 100%;
  height: 300px;
  background: #0f0f1e;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(167, 139, 250, 0.2);
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.file-btn {
  width: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  color: #fff;
  margin-bottom: 1rem;
}

.file-btn:hover {
  background: linear-gradient(90deg, #6d28d9, #9333ea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.bar {
  flex: 1;
  height: 4px;
  background: #374151;
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #ec4899);
  transition: width 0.1s linear;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.play-btn {
  flex: 1;
  background: linear-gradient(90deg, #10b981, #059669);
  color: #fff;
}

.play-btn:hover {
  background: linear-gradient(90deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.stop-btn {
  flex: 1;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: #fff;
}

.stop-btn:hover {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.viz-select {
  width: 100%;
  padding: 0.75rem;
  background: #374151;
  color: #fff;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.viz-select:hover {
  border-color: rgba(167, 139, 250, 0.6);
}

.viz-select:focus {
  outline: none;
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
}
</style>
