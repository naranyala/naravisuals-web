

<template>
  <div class="daw-demo">
    <div class="container">
      <h1>🎵 Vue DAW Demo</h1>
      <p class="subtitle">Audio Player & Equalizer Plugin System</p>

      <div v-if="status" class="status">{{ status }}</div>

      <!-- Audio Player Section -->
      <section class="section">
        <h2 class="section-title">Audio Player</h2>
        
        <div class="file-input-wrapper">
          <input 
            type="file" 
            accept="audio/*" 
            @change="handleFileSelect"
            :disabled="!isInitialized"
          />
        </div>

        <div v-if="audioLoaded">
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          
          <div class="progress-bar" @click="seekTo">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>

          <div class="controls">
            <button 
              @click="playAudio" 
              :disabled="isPlaying"
              class="btn-primary"
            >
              ▶️ Play
            </button>
            <button 
              @click="pauseAudio" 
              :disabled="!isPlaying"
              class="btn-secondary"
            >
              ⏸️ Pause
            </button>
            <button 
              @click="stopAudio"
              class="btn-danger"
            >
              ⏹️ Stop
            </button>
          </div>

          <canvas ref="visualizer" class="visualizer"></canvas>
        </div>
      </section>

      <!-- Equalizer Section -->
      <section class="section">
        <h2 class="section-title">Equalizer</h2>

        <div class="presets">
          <button 
            v-for="preset in presets" 
            :key="preset"
            @click="applyPreset(preset)"
            :class="['preset-btn', 'btn-primary', { active: activePreset === preset }]"
          >
            {{ preset }}
          </button>
        </div>

        <button 
          @click="toggleAdvanced"
          class="btn-secondary"
          style="margin-bottom: 15px;"
        >
          {{ showAdvanced ? '🔽 Hide Advanced' : '🔼 Show Advanced' }}
        </button>

        <div class="eq-bands">
          <div v-for="(band, index) in bands" :key="index" class="band">
            <div class="band-label">{{ band.label }}</div>
            
            <div class="slider-group">
              <div class="slider-label">
                <span>Gain</span>
                <strong>{{ band.gain.toFixed(1) }} dB</strong>
              </div>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="0.1"
                :value="band.gain"
                @input="setGain(index, parseFloat($event.target.value))"
              />
            </div>

            <div v-if="showAdvanced" class="advanced-controls">
              <div class="slider-group">
                <div class="slider-label">
                  <span>Frequency</span>
                  <strong>{{ band.freq.toFixed(0) }} Hz</strong>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="20000" 
                  step="1"
                  :value="band.freq"
                  @input="setFrequency(index, parseFloat($event.target.value))"
                />
              </div>

              <div class="slider-group">
                <div class="slider-label">
                  <span>Q</span>
                  <strong>{{ band.Q.toFixed(2) }}</strong>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1"
                  :value="band.Q"
                  @input="setQ(index, parseFloat($event.target.value))"
                />
              </div>
            </div>
          </div>
        </div>

        <button @click="resetEQ" class="btn-danger">Reset EQ</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import daw from '../../lib/audio/daw_core.js'
import { AudioPlayerPlugin } from '../../lib/audio/audio_player_plugin.js'
import { EnrichedEqualizerPlugin } from '../../lib/audio/enriched_equalizer_plugin.js'


// State
const isInitialized = ref(false);
const status = ref('Click to load an audio file to begin');
const audioLoaded = ref(false);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const visualizer = ref(null);

// EQ State
const bands = ref([]);
const showAdvanced = ref(false);
const activePreset = ref('flat');
const presets = ['flat', 'bassBoost', 'trebleBoost', 'vocal', 'rock'];

// Plugins
let audioPlayer = null;
let equalizer = null;
let animationId = null;
let updateInterval = null;

// Computed
const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

// Initialize DAW
const initDAW = async () => {
  try {
    await daw.init();
    
    // Register plugins
    audioPlayer = daw.register('player', AudioPlayerPlugin);
    equalizer = daw.register('eq', EnrichedEqualizerPlugin);
    
    await equalizer.init();
    
    // Initialize bands from plugin
    bands.value = equalizer.getBands();
    showAdvanced.value = equalizer.state.showAdvanced;
    activePreset.value = equalizer.state.activePreset;
    
    isInitialized.value = true;
    status.value = 'DAW initialized. Load an audio file to start.';
    
    // Listen for EQ state changes
    window.addEventListener('eq-state-change', handleEQStateChange);
  } catch (error) {
    status.value = `Error initializing DAW: ${error.message}`;
  }
};

// Handle file selection
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    status.value = 'Loading audio file...';
    await audioPlayer.loadFile(file);
    
    duration.value = audioPlayer.getDuration();
    audioLoaded.value = true;
    status.value = `Loaded: ${file.name}`;
    
    startVisualizer();
  } catch (error) {
    status.value = `Error loading file: ${error.message}`;
  }
};

// Audio controls
const playAudio = () => {
  audioPlayer.play();
  isPlaying.value = audioPlayer.isPlaying;
  startTimeUpdate();
};

const pauseAudio = () => {
  audioPlayer.pause();
  isPlaying.value = audioPlayer.isPlaying;
  stopTimeUpdate();
};

const stopAudio = () => {
  audioPlayer.stop();
  isPlaying.value = audioPlayer.isPlaying;
  currentTime.value = 0;
  stopTimeUpdate();
};

const seekTo = (event) => {
  if (!audioLoaded.value) return;
  
  const rect = event.currentTarget.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  
  const wasPlaying = isPlaying.value;
  if (wasPlaying) {
    audioPlayer.pause();
  }
  
  audioPlayer.pauseTime = newTime;
  currentTime.value = newTime;
  
  if (wasPlaying) {
    audioPlayer.play();
  }
};

// Time update
const startTimeUpdate = () => {
  updateInterval = setInterval(() => {
    currentTime.value = audioPlayer.getCurrentTime();
    if (currentTime.value >= duration.value) {
      stopTimeUpdate();
      isPlaying.value = false;
    }
  }, 100);
};

const stopTimeUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

// Visualizer
const startVisualizer = () => {
  if (!visualizer.value) return;
  
  const canvas = visualizer.value;
  const ctx = canvas.getContext('2d');
  const analyser = daw.master.analyser;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  const draw = () => {
    animationId = requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;
      
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  };
  
  draw();
};

// EQ Controls
const setGain = (index, value) => {
  equalizer.setGain(index, value);
  bands.value = equalizer.getBands();
};

const setFrequency = (index, value) => {
  equalizer.setFrequency(index, value);
  bands.value = equalizer.getBands();
};

const setQ = (index, value) => {
  equalizer.setQ(index, value);
  bands.value = equalizer.getBands();
};

const resetEQ = () => {
  equalizer.reset();
  bands.value = equalizer.getBands();
  activePreset.value = equalizer.state.activePreset;
};

const applyPreset = (presetName) => {
  equalizer.applyPreset(presetName);
  bands.value = equalizer.getBands();
  activePreset.value = equalizer.state.activePreset;
};

const toggleAdvanced = () => {
  equalizer.toggleAdvanced();
  showAdvanced.value = equalizer.state.showAdvanced;
};

const handleEQStateChange = (event) => {
  bands.value = event.detail.bands;
  showAdvanced.value = event.detail.state.showAdvanced;
  activePreset.value = event.detail.state.activePreset;
};

// Utilities
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Lifecycle
onMounted(() => {
  initDAW();
});

onUnmounted(() => {
  stopTimeUpdate();
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('eq-state-change', handleEQStateChange);
});
</script>

<style scoped>
.daw-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 0.9em;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.section-title {
  font-size: 1.3em;
  color: #495057;
  margin-bottom: 15px;
  font-weight: 600;
}

.file-input-wrapper {
  margin-bottom: 20px;
}

input[type="file"] {
  display: block;
  padding: 10px;
  border: 2px dashed #667eea;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  background: white;
}

input[type="file"]:hover {
  border-color: #764ba2;
  background: #f8f9ff;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin: 15px 0;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.eq-bands {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.band {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.band-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.slider-group {
  margin-bottom: 12px;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9em;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
}

.presets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.preset-btn {
  padding: 8px 16px;
  font-size: 0.9em;
}

.preset-btn.active {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.advanced-controls {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #e9ecef;
}

.status {
  padding: 12px;
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  color: #0c5460;
  margin-bottom: 20px;
}

.visualizer {
  width: 100%;
  height: 100px;
  background: #000;
  border-radius: 8px;
  margin-top: 15px;
}
</style>
