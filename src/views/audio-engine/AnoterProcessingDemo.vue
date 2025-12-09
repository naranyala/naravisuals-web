
<!-- DAWDemo.vue -->
<template>
  <div class="daw-demo">
    <h1>🎵 DAW Audio Analyzer</h1>
    
    <!-- File Upload -->
    <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
      <input type="file" ref="fileInput" @change="handleFile" accept="audio/*" hidden>
      <div class="upload-content">
        <div class="icon">📁</div>
        <p>{{ audioFile ? audioFile.name : 'Click or drop audio file' }}</p>
        <small v-if="audioFile">Duration: {{ formatTime(duration) }}</small>
      </div>
    </div>

    <!-- Playback Controls -->
    <div class="controls">
      <button @click="togglePlay" :disabled="!audioFile">
        {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
      </button>
      <button @click="stopPlay" :disabled="!audioFile">⏹️ Stop</button>
      
      <div class="progress">
        <input type="range" v-model="position" :max="duration" step="0.1" @input="seek">
        <span>{{ formatTime(position) }} / {{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Spectrum Analysis -->
    <div class="analyzer-controls">
      <select v-model="fftSize" @change="updatePlugin">
        <option value="512">FFT: 512</option>
        <option value="1024">FFT: 1024</option>
        <option value="2048">FFT: 2048</option>
      </select>
      
      <select v-model="windowType" @change="updatePlugin">
        <option value="hann">Hann Window</option>
        <option value="hamming">Hamming</option>
        <option value="blackman">Blackman</option>
      </select>
      
      <label><input type="checkbox" v-model="normalized" @change="updatePlugin"> Normalize</label>
    </div>

    <!-- Visualization -->
    <div class="viz-container">
      <canvas ref="canvas" width="800" height="200"></canvas>
      <div class="viz-info">{{ spectrumLength }} frequency bins</div>
    </div>

    <!-- Status -->
    <div class="status">{{ status }}</div>
  </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import daw from '../../lib/audio/daw_core.js'
import { AnotherProcessingPlugin } from '../../lib/audio/another_processing_plugin.js'
import { AudioPlayerPlugin } from '../../lib/audio/audio_player_plugin.js'

// Refs
const canvas = ref(null)
const fileInput = ref(null)
const audioFile = ref(null)
const isPlaying = ref(false)
const position = ref(0)
const duration = ref(0)
const status = ref('Load an audio file')
const spectrumLength = ref(0)

// Plugin parameters
const fftSize = ref('2048')
const windowType = ref('hann')
const normalized = ref(false)

// Plugin instances
let analyzer = null
let player = null
let animFrame = null
let timeInterval = null

// Initialize
onMounted(async () => {
  await daw.init()
  
  // Register plugins
  analyzer = daw.register('analyzer', AnotherProcessingPlugin, {
    n_fft: parseInt(fftSize.value),
    window: windowType.value,
    normalized: normalized.value
  })
  await analyzer.init()
  
  player = new AudioPlayerPlugin(daw)
})

// File handling
const triggerFileInput = () => fileInput.value.click()

const handleDrop = async (e) => {
  const file = e.dataTransfer.files[0]
  if (file?.type.startsWith('audio/')) await loadAudio(file)
}

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (file) await loadAudio(file)
}

const loadAudio = async (file) => {
  audioFile.value = file
  await player.loadFile(file)
  duration.value = player.getDuration()
  position.value = 0
  status.value = 'Ready to play'
}

// Playback controls
const togglePlay = () => {
  if (!player) return
  
  if (!isPlaying.value) {
    player.play()
    isPlaying.value = true
    status.value = 'Playing'
    startVisualization()
    startTimeUpdate()
  } else {
    player.pause()
    isPlaying.value = false
    status.value = 'Paused'
    stopTimeUpdate()
  }
}

const stopPlay = () => {
  if (!player) return
  
  player.stop()
  isPlaying.value = false
  position.value = 0
  status.value = 'Stopped'
  stopTimeUpdate()
  stopVisualization()
}

const seek = () => {
  if (!player) return
  stopPlay()
  // Note: AudioPlayerPlugin needs seek functionality
  // For now, just update position display
}

const startTimeUpdate = () => {
  timeInterval = setInterval(() => {
    position.value = player.getCurrentTime()
    if (position.value >= duration.value) stopPlay()
  }, 100)
}

const stopTimeUpdate = () => {
  clearInterval(timeInterval)
}

// Plugin update
const updatePlugin = () => {
  if (!analyzer) return
  analyzer.set('n_fft', parseInt(fftSize.value))
  analyzer.set('window', windowType.value)
  analyzer.set('normalized', normalized.value)
}

// Visualization
const startVisualization = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  
  const draw = () => {
    if (!isPlaying.value) {
      animFrame = null
      return
    }
    
    const spectrum = analyzer.spectrogram
    if (!spectrum) {
      animFrame = requestAnimationFrame(draw)
      return
    }
    
    spectrumLength.value = spectrum.length
    
    // Clear with fade effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'
    ctx.fillRect(0, 0, width, height)
    
    // Draw spectrum
    const barWidth = width / spectrum.length
    for (let i = 0; i < spectrum.length; i++) {
      const value = Math.min(spectrum[i] * 100, 1)
      const barHeight = value * height
      const hue = (i / spectrum.length) * 240
      
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
    }
    
    animFrame = requestAnimationFrame(draw)
  }
  
  draw()
}

const stopVisualization = () => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
  }
}

// Helper
const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Cleanup
onBeforeUnmount(() => {
  stopPlay()
  if (animFrame) cancelAnimationFrame(animFrame)
  if (analyzer) analyzer.destroy()
})
</script>

<style scoped>
.daw-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: white;
  font-family: system-ui, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #6ee7b7;
}

.upload-area {
  border: 2px dashed #667eea;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 20px;
  transition: background 0.3s;
}

.upload-area:hover {
  background: rgba(102, 126, 234, 0.1);
}

.upload-content .icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover:not(:disabled) {
  transform: scale(1.05);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress input {
  flex: 1;
}

.analyzer-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

select, label {
  padding: 8px 12px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 6px;
  color: white;
}

.viz-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

canvas {
  width: 100%;
  height: 200px;
  background: #1a1a2e;
  border-radius: 6px;
  display: block;
}

.viz-info {
  text-align: center;
  margin-top: 10px;
  font-family: monospace;
  color: #9ca3af;
}

.status {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #6ee7b7;
}

@media (max-width: 600px) {
  .controls {
    flex-direction: column;
  }
  
  .analyzer-controls {
    flex-direction: column;
  }
}
</style>
