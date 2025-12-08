
<template>
  <div class="demo-container">
    <div class="card">
      <h1>🎵 Audio Feature Extraction</h1>
      <p class="subtitle">Upload an audio file to see real-time feature analysis</p>
      
      <input 
        type="file" 
        accept="audio/*" 
        @change="loadAudio"
        ref="fileInput"
        style="display: none"
      />
      
      <div v-if="!audioFile" class="upload-area">
        <button @click="$refs.fileInput.click()" class="upload-btn">
          📁 Choose Audio File
        </button>
      </div>
      
      <div v-else class="audio-controls">
        <div class="file-info">
          <span class="file-name">🎵 {{ audioFile.name }}</span>
          <button @click="dismissAudio" class="dismiss-btn" title="Remove audio">
            ✕
          </button>
        </div>
        
        <div class="player-controls">
          <button @click="togglePlayPause" class="control-btn play-btn">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          
          <button @click="stopAudio" class="control-btn">
            ⏹
          </button>
          
          <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input 
              type="range" 
              v-model.number="volume" 
              min="0" 
              max="1" 
              step="0.01"
              @input="updateVolume"
              class="volume-slider"
            />
            <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
          </div>
        </div>
        
        <div class="status-bar" :class="statusClass">
          <span class="status-indicator"></span>
          {{ statusMessage }}
        </div>
      </div>
    </div>
    
    <div v-if="features" class="features-container">
      <!-- Energy Features -->
      <div class="card">
        <h2>⚡ Energy & Dynamics</h2>
        <div class="feature-grid">
          <div class="feature-box">
            <div class="feature-label">RMS Level</div>
            <div class="feature-value">{{ features.rms.toFixed(3) }}</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Peak Level</div>
            <div class="feature-value">{{ features.peak.toFixed(3) }}</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Onset Detection</div>
            <div class="feature-value">
              <span class="onset-dot" :class="{ active: features.onset }"></span>
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Crest Factor</div>
            <div class="feature-value">{{ features.crestFactor.toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Spectral Features -->
      <div class="card">
        <h2>🌈 Spectral Features</h2>
        <div class="feature-grid">
          <div class="feature-box">
            <div class="feature-label">Centroid</div>
            <div class="feature-value">{{ (features.centroid / 1000).toFixed(2) }} kHz</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Brightness</div>
            <div class="feature-value">{{ features.brightness.toFixed(3) }}</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Rolloff</div>
            <div class="feature-value">{{ (features.rolloff / 1000).toFixed(2) }} kHz</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Flux</div>
            <div class="feature-value">{{ features.flux.toFixed(3) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Perceptual Features -->
      <div class="card">
        <h2>👂 Perceptual</h2>
        <div class="feature-grid">
          <div class="feature-box">
            <div class="feature-label">Loudness</div>
            <div class="feature-value">{{ features.loudness.toFixed(3) }}</div>
          </div>
          <div class="feature-box">
            <div class="feature-label">Roughness</div>
            <div class="feature-value">{{ features.roughness.toFixed(3) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Beat Phase -->
      <div class="card">
        <h2>🎶 Beat Phase (120 BPM)</h2>
        <div class="phase-display">
          <div class="phase-circle">
            <div 
              class="phase-hand" 
              :style="{ transform: `rotate(${features.phase * 360}deg)` }"
            ></div>
          </div>
          <div class="phase-text">
            {{ (features.phase * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
      
      <!-- MFCC -->
      <div class="card">
        <h2>🎨 MFCC Coefficients</h2>
        <div class="mfcc-bars">
          <div 
            v-for="(coeff, i) in features.mfcc" 
            :key="i"
            class="mfcc-bar"
            :style="{ height: (Math.abs(coeff) * 10) + 'px' }"
            :title="`MFCC ${i}: ${coeff.toFixed(2)}`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue';
import daw from '../../lib/audio/daw_core.js';
import { EnrichExtractionPlugin } from '../../lib/audio/enrich_extraction_plugin.js';


// Audio state machine states
const AUDIO_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error'
};

// State
const fileInput = ref(null);
const audioFile = ref(null);
const audioState = ref(AUDIO_STATE.IDLE);
const volume = ref(0.8);
const features = ref(null);

// Computed
const isPlaying = computed(() => audioState.value === AUDIO_STATE.PLAYING);

const statusMessage = computed(() => {
  switch (audioState.value) {
    case AUDIO_STATE.IDLE: return 'No audio loaded';
    case AUDIO_STATE.LOADING: return 'Loading audio...';
    case AUDIO_STATE.READY: return 'Ready to play';
    case AUDIO_STATE.PLAYING: return '▶ Playing';
    case AUDIO_STATE.PAUSED: return '⏸ Paused';
    case AUDIO_STATE.STOPPED: return '⏹ Stopped';
    case AUDIO_STATE.ERROR: return '❌ Error loading audio';
    default: return '';
  }
});

const statusClass = computed(() => {
  switch (audioState.value) {
    case AUDIO_STATE.PLAYING: return 'status-playing';
    case AUDIO_STATE.PAUSED: return 'status-paused';
    case AUDIO_STATE.ERROR: return 'status-error';
    default: return '';
  }
});

// Plugin instances
let plugin = null;
let audioSource = null;
let audioBuffer = null;
let unsubscribe = null;
let isInitialized = false;
let gainNode = null;

// Initialize DAW and Plugin
const initializeAudio = async () => {
  if (isInitialized) return;
  
  try {
    // Initialize DAW
    await daw.init();
    
    // Create gain node for volume control
    gainNode = daw.audioContext.createGain();
    gainNode.gain.value = volume.value;
    
    // Create and initialize plugin
    plugin = new EnrichExtractionPlugin(daw, {
      bpm: 120,
      frameRate: 20,
      fftSize: 4096
    });
    
    await plugin.init();
    
    // Connect: plugin -> gain -> master
    plugin.output.connect(gainNode);
    gainNode.connect(daw.master.gain);
    
    // Subscribe to features
    unsubscribe = plugin.on('features', (data) => {
      features.value = { ...data };
    });
    
    isInitialized = true;
    console.log('Audio system initialized');
  } catch (error) {
    console.error('Failed to initialize:', error);
    audioState.value = AUDIO_STATE.ERROR;
    throw error;
  }
};

// Load audio file
const loadAudio = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    audioState.value = AUDIO_STATE.LOADING;
    audioFile.value = file;
    
    // Initialize if needed
    if (!isInitialized) {
      await initializeAudio();
    }
    
    // Stop and cleanup existing audio
    if (audioSource) {
      try {
        audioSource.disconnect();
        audioSource.stop();
      } catch (e) {
        // Already stopped
      }
      audioSource = null;
    }
    
    // Load audio file
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await daw.audioContext.decodeAudioData(arrayBuffer);
    
    audioState.value = AUDIO_STATE.READY;
    
    // Auto-play
    playAudio();
    
    console.log('Audio loaded successfully');
  } catch (error) {
    console.error('Error loading audio:', error);
    audioState.value = AUDIO_STATE.ERROR;
    audioFile.value = null;
  }
};

// Play audio
const playAudio = () => {
  if (!audioBuffer) return;
  
  try {
    // If paused, just resume the audio context
    if (audioState.value === AUDIO_STATE.PAUSED) {
      daw.audioContext.resume();
      audioState.value = AUDIO_STATE.PLAYING;
      return;
    }
    
    // If playing, do nothing
    if (audioState.value === AUDIO_STATE.PLAYING) {
      return;
    }
    
    // Stop existing source if any
    if (audioSource) {
      try {
        audioSource.disconnect();
        audioSource.stop();
      } catch (e) {
        // Already stopped
      }
      audioSource = null;
    }
    
    // Create new source for READY or STOPPED states
    audioSource = daw.audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.loop = true;
    audioSource.connect(plugin.input);
    audioSource.start();
    
    // Resume audio context if suspended
    if (daw.audioContext.state === 'suspended') {
      daw.audioContext.resume();
    }
    
    audioState.value = AUDIO_STATE.PLAYING;
  } catch (error) {
    console.error('Error playing audio:', error);
    audioState.value = AUDIO_STATE.ERROR;
  }
};

// Pause audio
const pauseAudio = () => {
  if (audioState.value !== AUDIO_STATE.PLAYING) return;
  
  try {
    // Suspend audio context (pauses all audio)
    daw.audioContext.suspend();
    audioState.value = AUDIO_STATE.PAUSED;
  } catch (error) {
    console.error('Error pausing audio:', error);
  }
};

// Toggle play/pause
const togglePlayPause = () => {
  if (audioState.value === AUDIO_STATE.PLAYING) {
    pauseAudio();
  } else {
    playAudio();
  }
};

// Stop audio
const stopAudio = () => {
  if (!audioSource) return;
  
  try {
    audioSource.disconnect();
    audioSource.stop();
    audioSource = null;
    
    // Resume context if suspended
    if (daw.audioContext.state === 'suspended') {
      daw.audioContext.resume();
    }
    
    audioState.value = AUDIO_STATE.STOPPED;
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

// Dismiss audio file
const dismissAudio = () => {
  // Stop audio first
  if (audioSource) {
    try {
      audioSource.disconnect();
      audioSource.stop();
    } catch (e) {
      // Already stopped
    }
    audioSource = null;
  }
  
  // Clear state
  audioFile.value = null;
  audioBuffer = null;
  features.value = null;
  audioState.value = AUDIO_STATE.IDLE;
  
  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  console.log('Audio dismissed');
};

// Update volume
const updateVolume = () => {
  if (gainNode) {
    gainNode.gain.value = volume.value;
  }
};

// Cleanup on unmount
onBeforeUnmount(() => {
  console.log('Cleaning up...');
  
  if (unsubscribe) {
    unsubscribe();
  }
  
  if (audioSource) {
    try {
      audioSource.disconnect();
      audioSource.stop();
    } catch (e) {
      // Already stopped
    }
  }
  
  if (plugin) {
    plugin.destroy();
  }
});
</script>

<style scoped>
.demo-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 28px;
}

h2 {
  color: #34495e;
  margin: 0 0 20px 0;
  font-size: 20px;
}

.subtitle {
  color: #7f8c8d;
  margin: 0 0 25px 0;
  font-size: 14px;
}

.upload-area {
  margin-bottom: 15px;
}

.upload-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.audio-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dismiss-btn {
  padding: 5px 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
  margin-left: 10px;
}

.dismiss-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-btn {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 50px;
}

.control-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

.play-btn {
  background: #27ae60;
}

.play-btn:hover {
  background: #229954;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  margin-left: 15px;
}

.volume-icon {
  font-size: 18px;
}

.volume-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-value {
  font-weight: 600;
  color: #2c3e50;
  min-width: 45px;
  text-align: right;
  font-size: 14px;
}

.status-bar {
  padding: 10px 15px;
  background: #ecf0f1;
  border-radius: 6px;
  text-align: center;
  color: #7f8c8d;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #95a5a6;
}

.status-bar.status-playing {
  background: #d4edda;
  color: #155724;
}

.status-bar.status-playing .status-indicator {
  background: #27ae60;
  animation: pulse 1.5s infinite;
}

.status-bar.status-paused {
  background: #fff3cd;
  color: #856404;
}

.status-bar.status-paused .status-indicator {
  background: #f39c12;
}

.status-bar.status-error {
  background: #f8d7da;
  color: #721c24;
}

.status-bar.status-error .status-indicator {
  background: #e74c3c;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.features-container {
  animation: fadeIn 0.5s;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.feature-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.feature-label {
  font-size: 11px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  font-weight: 600;
}

.feature-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

.onset-dot {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #bdc3c7;
  transition: all 0.1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.onset-dot.active {
  background: #e74c3c;
  box-shadow: 0 0 20px #e74c3c, 0 0 40px rgba(231, 76, 60, 0.5);
  transform: scale(1.4);
}

.phase-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.phase-circle {
  width: 140px;
  height: 140px;
  border: 5px solid #667eea;
  border-radius: 50%;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.phase-hand {
  position: absolute;
  width: 5px;
  height: 60px;
  background: #e74c3c;
  top: 10px;
  left: 67.5px;
  transform-origin: 2.5px 60px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s linear;
  will-change: transform;
}

.phase-text {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.mfcc-bars {
  display: flex;
  gap: 4px;
  height: 100px;
  align-items: flex-end;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.mfcc-bar {
  flex: 1;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 2px;
  min-height: 3px;
  max-height: 100%;
  transition: height 0.15s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  will-change: height;
}

.mfcc-bar:hover {
  opacity: 0.7;
}
</style>
