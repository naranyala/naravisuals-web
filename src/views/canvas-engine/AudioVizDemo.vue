<template>
  <div class="audio-viz-demo">
    <h2>🎵 Audio Visualizer Demo</h2>

    <div class="controls">
      <button @click="toggleAudio" :disabled="!audioInitialized || !hasAudio">
        {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
      </button>

      <button @click="stopAudio" :disabled="!isPlaying">
        ⏹️ Stop
      </button>

      <button @click="toggleMicrophone" :class="{ active: usingMicrophone }">
        🎤 {{ usingMicrophone ? 'Stop Mic' : 'Use Microphone' }}
      </button>

      <div class="file-upload">
        <input type="file" ref="fileInput" @change="handleFileUpload" accept="audio/*" class="file-input" />
        <button @click="triggerFileInput" class="file-button">
          📁 Choose Audio File
        </button>
        <span class="file-name">{{ currentFileName || 'No file selected' }}</span>
      </div>

      <label>
        Visualization Type:
        <select v-model="vizType">
          <option value="bars">Frequency Bars</option>
          <option value="circle">Circular Visualizer</option>
          <option value="waveform">Waveform</option>
          <option value="particles">Audio Particles</option>
          <option value="spectrum">Spectrum Circle</option>
          <option value="bouncers">Frequency Bouncers</option>
        </select>
      </label>
    </div>

    <div class="audio-info" v-if="hasAudio && !usingMicrophone">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>
    </div>

    <div class="canvas-container">
      <canvas ref="canvas" width="800" height="600"></canvas>
    </div>

    <div class="info" v-if="audioViz">
      <div>Volume: {{ (volume * 100).toFixed(1) }}%</div>
      <div>Bass: {{ (ranges.bass * 100).toFixed(1) }}%</div>
      <div>Mid: {{ (ranges.mid * 100).toFixed(1) }}%</div>
      <div>Treble: {{ (ranges.treble * 100).toFixed(1) }}%</div>
      <div>Status: {{ getStatusText() }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { mathPlugin } from '../../lib/engine/mathPlugin.js';
import { audioVizPlugin } from '../../lib/engine/audioVizPlugin.js';

// Refs
const canvas = ref(null);
const fileInput = ref(null);
const app = ref(null);
const audioViz = ref(null);

// State
const isPlaying = ref(false);
const audioInitialized = ref(false);
const usingMicrophone = ref(false);
const vizType = ref('bars');
const volume = ref(0);
const ranges = ref({ bass: 0, mid: 0, treble: 0 });
const currentFileName = ref('');
const currentTime = ref(0);
const duration = ref(0);
const progressPercentage = ref(0);

// Audio buffer
const currentAudioBuffer = ref(null);

// Computed
const hasAudio = ref(false);

// Current visualization objects
let currentViz = [];

// Initialize canvas and plugins
onMounted(async () => {
  if (!canvas.value) return;

  // Create canvas app
  app.value = createCanvasApp(canvas.value);
  app.value.use(mathPlugin);
  app.value.use(audioVizPlugin);

  audioViz.value = app.value.audioViz;

  // Wait for audio initialization
  audioInitialized.value = await audioViz.value.init();

  // Start update loop for metrics
  app.value.start(function* () {
    while (true) {
      if (audioViz.value) {
        volume.value = audioViz.value.getVolumeLevel();
        ranges.value = audioViz.value.getAllFrequencyRanges();

        // Update time and progress for file playback
        if (hasAudio.value && !usingMicrophone.value) {
          currentTime.value = audioViz.value.getCurrentTime();
          duration.value = audioViz.value.getDuration();
          if (duration.value > 0) {
            progressPercentage.value = (currentTime.value / duration.value) * 100;
          }
        }
      }
      yield 100; // Update every 100ms
    }
  });

  createVisualization();
});

// Clean up
onUnmounted(() => {
  if (audioViz.value) {
    audioViz.value.cleanup();
  }
});

// Trigger file input
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Check if it's an audio file
  if (!file.type.startsWith('audio/')) {
    alert('Please select an audio file');
    return;
  }

  currentFileName.value = file.name;

  try {
    // Stop any current playback
    audioViz.value.stopAudio();

    // Load and decode the audio file
    currentAudioBuffer.value = await audioViz.value.loadAudioFile(file);

    if (currentAudioBuffer.value) {
      hasAudio.value = true;
      // Auto-play the loaded file
      playAudioFile();
    } else {
      alert('Error loading audio file');
    }
  } catch (error) {
    console.error('Error handling file upload:', error);
    alert('Error loading audio file');
  }
};

// Play audio file
const playAudioFile = () => {
  if (!currentAudioBuffer.value) return;

  const success = audioViz.value.playAudioBuffer(currentAudioBuffer.value, () => {
    // Playback ended
    isPlaying.value = false;
    currentTime.value = duration.value;
    progressPercentage.value = 100;
  });

  if (success) {
    isPlaying.value = true;
  }
};

// Toggle audio playback
const toggleAudio = () => {
  if (usingMicrophone.value) return;

  if (isPlaying.value) {
    audioViz.value.stopAudio();
    isPlaying.value = false;
  } else {
    if (currentAudioBuffer.value) {
      playAudioFile();
    }
  }
};

// Stop audio completely
const stopAudio = () => {
  audioViz.value.stopAudio();
  isPlaying.value = false;
  currentTime.value = 0;
  progressPercentage.value = 0;
};

// Toggle microphone input
const toggleMicrophone = async () => {
  if (usingMicrophone.value) {
    // Stop microphone
    audioViz.value.cleanup();
    await audioViz.value.init(); // Reinitialize for audio files
    usingMicrophone.value = false;
    hasAudio.value = false;
  } else {
    // Start microphone
    const success = await audioViz.value.connectMicrophone();
    if (success) {
      usingMicrophone.value = true;
      isPlaying.value = true;
      hasAudio.value = true;
      currentFileName.value = 'Microphone Input';
    }
  }

  createVisualization();
};

// Format time for display
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get status text
const getStatusText = () => {
  if (usingMicrophone.value) return 'Microphone Input';
  if (isPlaying.value) return 'Playing';
  if (hasAudio.value) return 'Paused';
  return 'No Audio';
};

// Watch for visualization type changes
watch(vizType, createVisualization);

// Create visualization based on current type
function createVisualization() {
  // Clear previous visualization
  currentViz.forEach(obj => {
    if (obj.remove) obj.remove();
    else app.value.root.remove(obj);
  });
  currentViz = [];

  if (!app.value) return;

  switch (vizType.value) {
    case 'bars':
      currentViz.push(app.value.audioViz.shapes.createFrequencyBars(0, 400, 800, 200));
      break;

    case 'circle':
      currentViz.push(app.value.audioViz.shapes.createCircularVisualizer(400, 300, 150));
      break;

    case 'waveform':
      currentViz.push(app.value.audioViz.shapes.createWaveform(0, 400, 800, 200));
      break;

    case 'particles':
      currentViz.push(app.value.audioViz.shapes.createAudioParticles(150));
      break;

    case 'spectrum':
      currentViz.push(app.value.audioViz.shapes.createSpectrumCircle(400, 300, 180));
      break;

    case 'bouncers':
      const bouncers = app.value.audioViz.animations.createFrequencyBouncers(12);
      currentViz.push(...bouncers);
      break;
  }

  // Add some mathematical background for context
  const coordinates = app.value.math.shapes.createCoordinateSystem(400, 300, 50, '#333');
  currentViz.push(...coordinates);
}
</script>

<style scoped>
.audio-viz-demo {
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background: #4ecdc4;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.controls button:hover:not(:disabled) {
  background: #45b7d1;
}

.controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.controls button.active {
  background: #ff6b6b;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input {
  display: none;
}

.file-button {
  background: #96ceb4 !important;
}

.file-button:hover {
  background: #88c1a1 !important;
}

.file-name {
  font-size: 0.9em;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.controls select {
  padding: 5px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.audio-info {
  margin: 15px 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4ecdc4;
  transition: width 0.1s;
}

.time-display {
  font-size: 0.9em;
  color: #666;
  min-width: 80px;
}

.canvas-container {
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
  background: #1a1a1a;
}

canvas {
  display: block;
}

.info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 15px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
}

.info div {
  text-align: center;
  padding: 5px;
  background: white;
  border-radius: 3px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .file-upload {
    flex-direction: column;
    align-items: stretch;
  }

  .file-name {
    max-width: none;
    text-align: center;
  }
}
</style>
