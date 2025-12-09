<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import daw from '../../lib/audio/daw_core.js';
import { VizWebglPlugin } from '../../lib/audio/viz_webgl_plugin.js';
import { AudioPlayerPlugin } from '../../lib/audio/audio_player_plugin.js';


// ========== Vue Component State ==========
const canvas = ref(null);
const fileInput = ref(null);
const fileName = ref('');
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

// Audio features display
const centroid = ref(0);
const flux = ref(0);
const rms = ref(0);

let player = null;
let vizWebgl = null;
let animFrame = null;

onMounted(async () => {
  await daw.init();
  
  // Register WebGL visualizer
  daw.register('viz_webgl', VizWebglPlugin, { canvas: canvas.value });
  vizWebgl = daw.get('viz_webgl');
  
  // Register audio player
  daw.register('player', AudioPlayerPlugin);
  player = daw.get('player');
  
  startAnimation();
});

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
});

function startAnimation() {
  const animate = (time) => {
    if (vizWebgl) {
      vizWebgl.update(time);
      vizWebgl.render();
      
      // Update audio features display
      if (vizWebgl.uniforms) {
        centroid.value = vizWebgl.uniforms.u_centroid.toFixed(1);
        flux.value = vizWebgl.uniforms.u_flux.toFixed(3);
        rms.value = vizWebgl.uniforms.u_rms.toFixed(3);
      }
    }
    
    if (player && isPlaying.value) {
      currentTime.value = player.getCurrentTime();
    }
    
    animFrame = requestAnimationFrame(animate);
  };
  animate(0);
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
</script>

<template>
  <div class="container">
    <div class="player">
      <h1>WebGL Audio Visualizer</h1>
      <p class="subtitle">Shader-driven organic visuals</p>
      
      <canvas 
        ref="canvas" 
        width="1200" 
        height="800"
        class="viz-canvas"
      ></canvas>
      
      <div class="features">
        <div class="feature">
          <span class="label">Centroid</span>
          <span class="value">{{ centroid }} Hz</span>
        </div>
        <div class="feature">
          <span class="label">Flux</span>
          <span class="value">{{ flux }}</span>
        </div>
        <div class="feature">
          <span class="label">RMS</span>
          <span class="value">{{ rms }}</span>
        </div>
      </div>
      
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
            <div 
              class="fill" 
              :style="{ width: duration > 0 ? (currentTime / duration * 100) + '%' : '0%' }"
            ></div>
          </div>
          <span>{{ formatTime(duration) }}</span>
        </div>
        
        <div class="controls">
          <button @click="togglePlay" class="play-btn">
            {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button @click="handleStop" class="stop-btn">
            ⏹ Stop
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.player {
  max-width: 1200px;
  width: 100%;
}

h1 {
  color: #fff;
  text-align: center;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #888;
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.viz-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 3/2;
  background: #000;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 60px rgba(138, 43, 226, 0.3);
  border: 1px solid rgba(138, 43, 226, 0.2);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature {
  background: rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.file-btn {
  width: 100%;
  background: rgba(138, 43, 226, 0.2);
  color: #fff;
  border: 2px solid rgba(138, 43, 226, 0.5);
  margin-bottom: 1rem;
}

.file-btn:hover {
  background: rgba(138, 43, 226, 0.3);
  border-color: rgba(138, 43, 226, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.3);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #8a2be2, #da70d6);
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
}

.controls {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.play-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #fff;
  border: 2px solid rgba(34, 197, 94, 0.5);
}

.play-btn:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.stop-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fff;
  border: 2px solid rgba(239, 68, 68, 0.5);
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
  
  .controls {
    grid-template-columns: 1fr;
  }
  
  h1 {
    font-size: 1.75rem;
  }
}
</style>
