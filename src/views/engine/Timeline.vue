<template>
  <div class="timeline-container">
    <div class="controls">
      <div class="control-group">
        <button class="btn" :class="{ active: isPlaying }" @click="togglePlayback">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
        </button>
        <button class="btn" @click="stopPlayback">
          <i class="fas fa-stop"></i>
          <span>Stop</span>
        </button>
        <button class="btn" @click="rewind">
          <i class="fas fa-backward"></i>
          <span>Rewind</span>
        </button>
        <button class="btn" @click="fastForward">
          <i class="fas fa-forward"></i>
          <span>Fast Forward</span>
        </button>
      </div>
      <div class="control-group">
        <button class="btn" @click="addTrack">
          <i class="fas fa-plus"></i>
          <span>Add Track</span>
        </button>
        <button class="btn" @click="setTool('razor')">
          <i class="fas fa-cut"></i>
          <span>Razor</span>
        </button>
        <button class="btn" :class="{ active: currentTool === 'select' }" @click="setTool('select')">
          <i class="fas fa-hand-pointer"></i>
          <span>Select</span>
        </button>
      </div>
    </div>

    <div class="timeline-header">
      <div class="track-labels">
        <div v-for="(track, index) in tracks" :key="index" class="track-label" @click="selectTrack(index)">
          <i :class="getTrackIcon(track.type)"></i>
          {{ track.name }}
        </div>
      </div>
      <div class="timeline-ruler">
        <div class="ruler-markers">
          <div v-for="marker in visibleMarkers" :key="marker.time" class="marker" :class="{ minor: !marker.isMajor }"
            :style="{ left: `${marker.position}px` }">
            {{ marker.isMajor ? marker.label : '' }}
          </div>
        </div>
        <div class="current-time">{{ formatTime(currentTime) }}</div>
      </div>
    </div>

    <div class="timeline-tracks">
      <div class="tracks-container">
        <div class="tracks-labels"></div>
        <div ref="clipsContainer" class="clips-container" @scroll="handleScroll">
          <div v-for="clip in clips" :key="clip.id" class="clip" :class="[clip.type]" :style="{
            left: `${clip.start * pixelsPerSecond}px`,
            width: `${clip.duration * pixelsPerSecond}px`
          }" @click="selectClip(clip.id)">
            {{ clip.name }}
          </div>
        </div>
      </div>
      <div class="playhead" :style="{ left: `${currentTime * pixelsPerSecond}px` }">
        <div class="time-indicator">{{ formatTime(currentTime) }}</div>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-info">Ready | Duration: {{ formatTime(totalDuration) }}</div>
      <div class="zoom-controls">
        <span>Zoom:</span>
        <input type="range" class="zoom-slider" min="1" max="10" v-model="zoomLevel">
        <button class="btn" @click="zoomIn">
          <i class="fas fa-search-plus"></i>
        </button>
        <button class="btn" @click="zoomOut">
          <i class="fas fa-search-minus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// State
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(5400) // 1.5 hours in seconds
const zoomLevel = ref(3)
const currentTool = ref('select')
const selectedTrack = ref(null)
const selectedClip = ref(null)
const clipsContainer = ref(null)

// Tracks
const tracks = ref([
  { id: 1, name: 'Video 1', type: 'video' },
  { id: 2, name: 'Audio 1', type: 'audio' },
  { id: 3, name: 'Images', type: 'image' },
  { id: 4, name: 'Titles', type: 'text' }
])

// Clips
const clips = ref([
  { id: 1, trackId: 1, name: 'Intro Scene', type: 'video', start: 0, duration: 120 },
  { id: 2, trackId: 2, name: 'Background Music', type: 'audio', start: 30, duration: 240 },
  { id: 3, trackId: 3, name: 'Title Image', type: 'image', start: 120, duration: 60 },
  { id: 4, trackId: 4, name: 'Main Title', type: 'text', start: 150, duration: 30 },
  { id: 5, trackId: 1, name: 'Main Content', type: 'video', start: 180, duration: 360 },
  { id: 6, trackId: 2, name: 'Voiceover', type: 'audio', start: 200, duration: 340 },
  { id: 7, trackId: 3, name: 'Product Shot', type: 'image', start: 500, duration: 40 },
  { id: 8, trackId: 1, name: 'Closing Scene', type: 'video', start: 540, duration: 120 }
])

// Computed properties
const pixelsPerSecond = computed(() => 10 * zoomLevel.value)

const visibleMarkers = computed(() => {
  const markers = []
  const containerWidth = clipsContainer.value?.clientWidth || window.innerWidth
  const maxVisibleTime = containerWidth / pixelsPerSecond.value

  for (let i = 0; i <= totalDuration.value; i++) {
    const position = i * pixelsPerSecond.value
    if (position > containerWidth + 500) break // Add some buffer

    const isMajor = i % 60 === 0
    markers.push({
      time: i,
      position,
      isMajor,
      label: isMajor ? formatTime(i) : ''
    })
  }

  return markers
})

// Methods
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:00`
}

const getTrackIcon = (type) => {
  const icons = {
    video: 'fas fa-film',
    audio: 'fas fa-volume-up',
    image: 'fas fa-image',
    text: 'fas fa-text-height'
  }
  return icons[type] || 'fas fa-file'
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayback()
  }
}

const startPlayback = () => {
  const startTime = currentTime.value
  const startTimeStamp = performance.now()

  const animate = (timestamp) => {
    if (!isPlaying.value) return

    const elapsed = (timestamp - startTimeStamp) / 1000 // seconds
    currentTime.value = startTime + elapsed

    if (currentTime.value >= totalDuration.value) {
      stopPlayback()
      return
    }

    // Auto-scroll when playhead approaches edge
    if (clipsContainer.value) {
      const playheadPosition = currentTime.value * pixelsPerSecond.value
      const container = clipsContainer.value
      const scrollThreshold = 150

      if (playheadPosition > container.scrollLeft + container.clientWidth - scrollThreshold) {
        container.scrollLeft = playheadPosition - container.clientWidth + scrollThreshold
      } else if (playheadPosition < container.scrollLeft + scrollThreshold) {
        container.scrollLeft = Math.max(0, playheadPosition - scrollThreshold)
      }
    }

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

const stopPlayback = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const rewind = () => {
  currentTime.value = Math.max(0, currentTime.value - 5)
}

const fastForward = () => {
  currentTime.value = Math.min(totalDuration.value, currentTime.value + 5)
}

const addTrack = () => {
  const trackTypes = ['video', 'audio', 'image', 'text']
  const nextId = tracks.value.length + 1
  const type = trackTypes[(nextId - 1) % trackTypes.length]

  tracks.value.push({
    id: nextId,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.ceil(nextId / 4)}`,
    type
  })
}

const setTool = (tool) => {
  currentTool.value = tool
}

const selectTrack = (index) => {
  selectedTrack.value = index
}

const selectClip = (clipId) => {
  selectedClip.value = clipId
}

const handleScroll = () => {
  // Could add scroll-related logic here
}

const zoomIn = () => {
  zoomLevel.value = Math.min(10, zoomLevel.value + 1)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(1, zoomLevel.value - 1)
}

// Lifecycle
onMounted(() => {
  // Initialize container width
  nextTick(() => {
    if (clipsContainer.value) {
      clipsContainer.value.style.width = `${totalDuration.value * pixelsPerSecond.value}px`
    }
  })
})

// Watchers
import { watch } from 'vue'
watch(zoomLevel, (newVal, oldVal) => {
  nextTick(() => {
    if (clipsContainer.value) {
      clipsContainer.value.style.width = `${totalDuration.value * pixelsPerSecond.value}px`
    }
  })
})
</script>

<style scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #252526;
  border-radius: 4px;
  margin-bottom: 8px;
}

.control-group {
  display: flex;
  gap: 8px;
}

.btn {
  background: #3c3c3c;
  color: #d4d4d4;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: #454545;
  border-color: #5a5a5a;
}

.btn:active {
  background: #5a5a5a;
}

.btn.active {
  background: #0e639c;
  border-color: #0e639c;
}

.timeline-header {
  display: flex;
  background: #252526;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.track-labels {
  width: 200px;
  background: #2d2d30;
  border-right: 1px solid #3c3c3c;
  padding: 8px 0;
}

.track-label {
  padding: 8px 12px;
  border-bottom: 1px solid #3c3c3c;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.track-label:last-child {
  border-bottom: none;
}

.track-label:hover {
  background: #3c3c3c;
}

.track-label i {
  color: #4ec9b0;
}

.timeline-ruler {
  flex: 1;
  height: 40px;
  background: #252526;
  position: relative;
  overflow: hidden;
}

.ruler-markers {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.marker {
  height: 20px;
  border-right: 1px solid #3c3c3c;
  display: flex;
  align-items: center;
  padding-right: 4px;
  font-size: 12px;
  color: #9cdcfe;
  position: absolute;
}

.marker.minor {
  height: 10px;
  border-color: #2d2d30;
}

.current-time {
  position: absolute;
  top: 4px;
  right: 12px;
  font-size: 12px;
  color: #d4d4d4;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 3px;
}

.timeline-tracks {
  flex: 1;
  background: #252526;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.tracks-container {
  display: flex;
  height: 100%;
}

.tracks-labels {
  width: 200px;
  background: #2d2d30;
  border-right: 1px solid #3c3c3c;
}

.clips-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
}

.clips-container::-webkit-scrollbar {
  height: 8px;
}

.clips-container::-webkit-scrollbar-track {
  background: #2d2d30;
}

.clips-container::-webkit-scrollbar-thumb {
  background: #3c3c3c;
  border-radius: 4px;
}

.clips-container::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

.clip {
  position: absolute;
  height: 60px;
  top: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
  z-index: 1;
}

.clip:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.clip.video {
  background: linear-gradient(135deg, #9cdcfe 0%, #4ec9b0 100%);
  color: #1e1e1e;
}

.clip.audio {
  background: linear-gradient(135deg, #ce9178 0%, #d7ba7d 100%);
  color: #1e1e1e;
}

.clip.image {
  background: linear-gradient(135deg, #b5cea8 0%, #89d185 100%);
  color: #1e1e1e;
}

.clip.text {
  background: linear-gradient(135deg, #dcdcaa 0%, #d19a66 100%);
  color: #1e1e1e;
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ff6b6b;
  z-index: 20;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.7);
}

.playhead::after {
  content: "";
  position: absolute;
  top: -6px;
  left: -4px;
  width: 10px;
  height: 10px;
  background: #ff6b6b;
  border-radius: 50%;
}

.time-indicator {
  position: absolute;
  top: -25px;
  left: -20px;
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
  white-space: nowrap;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  background: #252526;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 13px;
  color: #9cdcfe;
}

.zoom-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.zoom-slider {
  width: 150px;
}

input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #3c3c3c;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #0e639c;
  cursor: pointer;
}

@media (max-width: 768px) {

  .track-labels,
  .tracks-labels {
    width: 120px;
  }

  .track-label {
    padding: 8px 8px;
    font-size: 12px;
  }

  .controls .btn span {
    display: none;
  }

  .controls .btn i {
    margin: 0;
  }
}
</style>
