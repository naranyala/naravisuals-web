<template>
  <div class="metadata-demo">
    <div class="container">
      <h1>🎵 Audio Metadata Extractor</h1>
      <p class="subtitle">Extract ID3, Vorbis, RIFF, and iXML metadata from audio files</p>

      <div v-if="status" class="status">{{ status }}</div>

      <!-- File Upload Section -->
      <section class="section">
        <h2 class="section-title">Select Audio File</h2>
        
        <div class="file-input-wrapper">
          <input 
            type="file" 
            accept="audio/*" 
            @change="handleFileSelect"
            :disabled="!isInitialized"
          />
          <p class="hint">Supports: MP3, FLAC, WAV, OGG, and more</p>
        </div>

        <div v-if="audioLoaded" class="file-info">
          <div class="info-row">
            <span class="label">Filename:</span>
            <span class="value">{{ metadata.filename }}</span>
          </div>
          <div class="info-row">
            <span class="label">Size:</span>
            <span class="value">{{ formatBytes(metadata.filesize) }}</span>
          </div>
          <div class="info-row">
            <span class="label">MIME Type:</span>
            <span class="value">{{ metadata.mime }}</span>
          </div>
          <div class="info-row" v-if="metadata.lastModified">
            <span class="label">Last Modified:</span>
            <span class="value">{{ formatDate(metadata.lastModified) }}</span>
          </div>
        </div>
      </section>

      <!-- Audio Player Section -->
      <section v-if="audioLoaded" class="section">
        <h2 class="section-title">Audio Player</h2>
        
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
      </section>

      <!-- Metadata Display Section -->
      <section v-if="hasMetadata" class="section">
        <h2 class="section-title">Extracted Metadata</h2>

        <!-- ID3v2 Tags -->
        <div v-if="metadata.id3v2" class="metadata-group">
          <h3 class="metadata-title">
            🏷️ ID3v2 Tags (Version {{ metadata.id3v2.version }})
          </h3>
          <div class="metadata-content">
            <textarea>{{ metadata.id3v2.tags }}</textarea>
          </div>
        </div>

        <!-- ID3v1 Tags -->
        <div v-if="metadata.title || metadata.artist || metadata.album" class="metadata-group">
          <h3 class="metadata-title">🎤 ID3v1 Tags</h3>
          <div class="metadata-content">
            <div v-if="metadata.title" class="metadata-row">
              <span class="meta-key">Title:</span>
              <span class="meta-value">{{ metadata.title }}</span>
            </div>
            <div v-if="metadata.artist" class="metadata-row">
              <span class="meta-key">Artist:</span>
              <span class="meta-value">{{ metadata.artist }}</span>
            </div>
            <div v-if="metadata.album" class="metadata-row">
              <span class="meta-key">Album:</span>
              <span class="meta-value">{{ metadata.album }}</span>
            </div>
            <div v-if="metadata.year" class="metadata-row">
              <span class="meta-key">Year:</span>
              <span class="meta-value">{{ metadata.year }}</span>
            </div>
            <div v-if="metadata.comment" class="metadata-row">
              <span class="meta-key">Comment:</span>
              <span class="meta-value">{{ metadata.comment }}</span>
            </div>
            <div v-if="metadata.genre !== undefined" class="metadata-row">
              <span class="meta-key">Genre:</span>
              <span class="meta-value">{{ getGenreName(metadata.genre) }}</span>
            </div>
          </div>
        </div>

        <!-- Vorbis Comments -->
        <div v-if="metadata.vorbis" class="metadata-group">
          <h3 class="metadata-title">📦 Vorbis Comments (OGG/FLAC)</h3>
          <div class="metadata-content">
            <div 
              v-for="(value, key) in metadata.vorbis" 
              :key="key"
              class="metadata-row"
            >
              <span class="meta-key">{{ key }}:</span>
              <span class="meta-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- RIFF INFO -->
        <div v-if="metadata.riff" class="metadata-group">
          <h3 class="metadata-title">🎹 RIFF LIST-INFO (WAV)</h3>
          <div class="metadata-content">
            <div 
              v-for="(value, key) in metadata.riff" 
              :key="key"
              class="metadata-row"
            >
              <span class="meta-key">{{ key }}:</span>
              <span class="meta-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- iXML -->
        <div v-if="metadata.ixml" class="metadata-group">
          <h3 class="metadata-title">📻 Broadcast Wave (iXML)</h3>
          <div class="metadata-content">
            <details>
              <summary>View XML Content</summary>
              <pre class="xml-content">{{ metadata.ixml }}</pre>
            </details>
          </div>
        </div>

        <!-- Export Button -->
        <div class="export-section">
          <button @click="exportMetadata" class="btn-primary">
            💾 Export as JSON
          </button>
          <button @click="copyMetadata" class="btn-secondary">
            📋 Copy to Clipboard
          </button>
        </div>
      </section>

      <!-- Empty State -->
      <section v-if="audioLoaded && !hasMetadata" class="section empty-metadata">
        <h2 class="section-title">No Metadata Found</h2>
        <p>This audio file doesn't contain any recognizable metadata tags.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import daw from '../../lib/audio/daw_core.js';
import { AudioPlayerPlugin } from '../../lib/audio/audio_player_plugin.js';
import { ShowMetadataPlugin } from '../../lib/audio/show_metadata_plugin.js';

// State
const isInitialized = ref(false);
const status = ref('Ready to extract metadata from audio files');
const audioLoaded = ref(false);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const metadata = ref({});
const visualizer = ref(null);

// Plugins
let audioPlayer = null;
let metadataPlugin = null;
let animationId = null;
let updateInterval = null;
let currentFile = null;

// Computed
const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

const hasMetadata = computed(() => {
  return metadata.value.id3v2 || 
         metadata.value.vorbis || 
         metadata.value.riff || 
         metadata.value.ixml ||
         metadata.value.title ||
         metadata.value.artist;
});

// ID3v1 Genre List
const genres = [
  'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge',
  'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B',
  'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska',
  'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient',
  'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical',
  'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise',
  'AlternRock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative',
  'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave',
  'Techno-Industrial', 'Electronic', 'Pop-Folk', 'Eurodance', 'Dream',
  'Southern Rock', 'Comedy', 'Cult', 'Gangsta', 'Top 40', 'Christian Rap',
  'Pop/Funk', 'Jungle', 'Native American', 'Cabaret', 'New Wave',
  'Psychadelic', 'Rave', 'Showtunes', 'Trailer', 'Lo-Fi', 'Tribal',
  'Acid Punk', 'Acid Jazz', 'Polka', 'Retro', 'Musical', 'Rock & Roll',
  'Hard Rock'
];

const getGenreName = (genreId) => {
  return genres[genreId] || `Unknown (${genreId})`;
};

// Initialize DAW
const initDAW = async () => {
  try {
    await daw.init();
    
    // Register plugins
    audioPlayer = daw.register('player', AudioPlayerPlugin);
    metadataPlugin = daw.register('metadata', ShowMetadataPlugin);
    
    isInitialized.value = true;
    status.value = 'Ready. Select an audio file to begin.';
  } catch (error) {
    status.value = `Error initializing: ${error.message}`;
  }
};

// Handle file selection
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    status.value = 'Extracting metadata...';
    currentFile = file;
    
    // Extract metadata
    const meta = await metadataPlugin.extract(file);
    metadata.value = meta;
    
    // Load audio
    await audioPlayer.loadFile(file);
    duration.value = audioPlayer.getDuration();
    
    audioLoaded.value = true;
    status.value = `Loaded: ${file.name}`;
    
    startVisualizer();
  } catch (error) {
    status.value = `Error: ${error.message}`;
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

// Export functions
const exportMetadata = () => {
  const json = JSON.stringify(metadata.value, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.value.filename || 'metadata'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const copyMetadata = async () => {
  const json = JSON.stringify(metadata.value, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    status.value = 'Metadata copied to clipboard!';
    setTimeout(() => {
      status.value = `Loaded: ${metadata.value.filename}`;
    }, 2000);
  } catch (error) {
    status.value = 'Failed to copy to clipboard';
  }
};

// Utilities
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString();
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
});
</script>

<style scoped>
.metadata-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1000px;
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

.hint {
  margin-top: 8px;
  font-size: 0.85em;
  color: #666;
}

.file-info {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: #495057;
  width: 140px;
}

.info-row .value {
  color: #666;
  flex: 1;
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

.metadata-group {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.metadata-title {
  font-size: 1.1em;
  color: #495057;
  margin-bottom: 15px;
  font-weight: 600;
}

.metadata-content {
  font-size: 0.95em;
}

.metadata-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f1f3f5;
}

.metadata-row:last-child {
  border-bottom: none;
}

.meta-key {
  font-weight: 600;
  color: #667eea;
  min-width: 120px;
}

.meta-value {
  color: #495057;
  flex: 1;
  word-break: break-word;
}

.empty-state {
  color: #999;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.xml-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85em;
  color: #495057;
  max-height: 300px;
  margin-top: 10px;
}

details summary {
  cursor: pointer;
  padding: 10px;
  background: #e9ecef;
  border-radius: 6px;
  font-weight: 600;
  color: #495057;
}

details summary:hover {
  background: #dee2e6;
}

.export-section {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.empty-metadata {
  text-align: center;
  color: #666;
}

.empty-metadata p {
  font-size: 1.1em;
  margin-top: 10px;
}
</style>
