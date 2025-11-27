<template>
  <div class="srt-editor">
    <header class="editor-header">
      <h1>SRT File Editor</h1>
      <div class="controls">
        <button class="btn btn-primary" @click="importFile">
          <span class="icon">📁</span> Import SRT
        </button>
        <button class="btn btn-primary" @click="exportFile" :disabled="subtitles.length === 0">
          <span class="icon">💾</span> Export SRT
        </button>
        <button class="btn btn-secondary" @click="addSubtitle">
          <span class="icon">➕</span> Add Subtitle
        </button>
      </div>
    </header>

    <div class="editor-container">
      <!-- Timeline Section -->
      <section class="timeline-section">
        <h2>Timeline</h2>
        <div class="timeline-visual" ref="timelineRef">
          <div class="timeline-track">
            <div
              v-for="(subtitle, index) in subtitles"
              :key="index"
              class="subtitle-block"
              :class="{ active: activeSubtitleIndex === index }"
              :style="{
                left: calculateBlockPosition(subtitle.startTime) + '%',
                width: calculateBlockWidth(subtitle.startTime, subtitle.endTime) + '%'
              }"
              @click="selectSubtitle(index)"
            >
              <span class="block-label">{{ index + 1 }}</span>
            </div>
            <div
              class="timeline-marker"
              :style="{ left: currentTimePosition + '%' }"
              @mousedown="startDrag"
            ></div>
          </div>
        </div>

        <div class="time-display">
          Current: {{ formatDisplayTime(currentTime) }}
        </div>
      </section>

      <!-- Subtitles List -->
      <section class="list-section">
        <h2>Subtitles ({{ subtitles.length }})</h2>
        <div class="subtitle-list">
          <div
            v-for="(subtitle, index) in subtitles"
            :key="index"
            class="subtitle-item"
            :class="{ active: activeSubtitleIndex === index }"
            @click="selectSubtitle(index)"
          >
            <div class="subtitle-header">
              <span class="subtitle-number">#{{ index + 1 }}</span>
              <span class="subtitle-time">
                {{ formatTime(subtitle.startTime) }} → {{ formatTime(subtitle.endTime) }}
              </span>
            </div>
            <div class="subtitle-text">
              {{ subtitle.text }}
            </div>
          </div>

          <div v-if="subtitles.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>No subtitles yet</p>
            <button class="btn btn-primary" @click="addSubtitle">Add First Subtitle</button>
          </div>
        </div>
      </section>

      <!-- Editor Section -->
      <section class="editor-section">
        <h2>
          {{ activeSubtitleIndex !== null ? `Edit Subtitle #${activeSubtitleIndex + 1}` : 'Subtitle Editor' }}
        </h2>

        <div v-if="activeSubtitleIndex !== null" class="editor-form">
          <div class="form-group">
            <label>Start Time</label>
            <input
              type="text"
              v-model="activeSubtitle.startTime"
              placeholder="00:00:00,000"
              class="time-input"
            >
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input
              type="text"
              v-model="activeSubtitle.endTime"
              placeholder="00:00:00,000"
              class="time-input"
            >
          </div>

          <div class="form-group">
            <label>Subtitle Text</label>
            <textarea
              v-model="activeSubtitle.text"
              placeholder="Enter subtitle text here..."
              rows="4"
            ></textarea>
          </div>

          <div class="editor-actions">
            <button class="btn btn-primary" @click="saveSubtitle">
              Save Changes
            </button>
            <button class="btn btn-danger" @click="deleteSubtitle">
              Delete Subtitle
            </button>
          </div>
        </div>

        <div v-else class="empty-editor">
          <div class="empty-icon">✏️</div>
          <p>Select a subtitle to edit or add a new one</p>
        </div>
      </section>
    </div>

    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInput"
      accept=".srt"
      style="display: none"
      @change="handleFileImport"
    >
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// Reactive data
const subtitles = ref([])
const activeSubtitleIndex = ref(null)
const timelineRef = ref(null)
const fileInput = ref(null)
const currentTimePosition = ref(0)
const isDragging = ref(false)

// Computed properties
const activeSubtitle = computed(() => {
  return activeSubtitleIndex.value !== null ? 
    subtitles.value[activeSubtitleIndex.value] : 
    null
})

const currentTime = computed(() => {
  const totalDuration = 120 // 2 minutes
  return (currentTimePosition.value / 100) * totalDuration
})

// Time formatting utilities
const formatTime = (timeString) => {
  if (!timeString) return '00:00:00,000'
  return timeString
}

const formatDisplayTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = (seconds % 60).toFixed(2)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`.replace('.', ',')
}

const timeToSeconds = (timeString) => {
  if (!timeString) return 0
  
  const parts = timeString.replace(',', '.').split(':')
  if (parts.length !== 3) return 0
  
  const hours = parseInt(parts[0]) || 0
  const minutes = parseInt(parts[1]) || 0
  const seconds = parseFloat(parts[2]) || 0
  
  return hours * 3600 + minutes * 60 + seconds
}

const secondsToTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`.replace('.', ',')
}

// Timeline calculations
const calculateBlockPosition = (startTime) => {
  const totalDuration = 120
  const startSeconds = timeToSeconds(startTime)
  return Math.min(100, Math.max(0, (startSeconds / totalDuration) * 100))
}

const calculateBlockWidth = (startTime, endTime) => {
  const totalDuration = 120
  const startSeconds = timeToSeconds(startTime)
  const endSeconds = timeToSeconds(endTime)
  const duration = Math.max(0.1, endSeconds - startSeconds)
  return Math.min(100, (duration / totalDuration) * 100)
}

// Subtitle management
const selectSubtitle = (index) => {
  activeSubtitleIndex.value = index
  // Update timeline position to subtitle start
  const startSeconds = timeToSeconds(subtitles.value[index].startTime)
  currentTimePosition.value = (startSeconds / 120) * 100
}

const addSubtitle = () => {
  const newSubtitle = {
    startTime: secondsToTime(currentTime.value),
    endTime: secondsToTime(currentTime.value + 5),
    text: 'New subtitle text'
  }
  
  subtitles.value.push(newSubtitle)
  activeSubtitleIndex.value = subtitles.value.length - 1
}

const saveSubtitle = () => {
  if (activeSubtitleIndex.value !== null) {
    // Validate time format
    const startValid = /^\d{2}:\d{2}:\d{2}[,.]\d{3}$/.test(activeSubtitle.value.startTime)
    const endValid = /^\d{2}:\d{2}:\d{2}[,.]\d{3}$/.test(activeSubtitle.value.endTime)
    
    if (!startValid || !endValid) {
      alert('Please use the format HH:MM:SS,mmm for time values')
      return
    }
    
    // Ensure end time is after start time
    if (timeToSeconds(activeSubtitle.value.endTime) <= timeToSeconds(activeSubtitle.value.startTime)) {
      alert('End time must be after start time')
      return
    }
    
    subtitles.value[activeSubtitleIndex.value] = { ...activeSubtitle.value }
  }
}

const deleteSubtitle = () => {
  if (activeSubtitleIndex.value !== null) {
    subtitles.value.splice(activeSubtitleIndex.value, 1)
    activeSubtitleIndex.value = null
  }
}

// File operations
const importFile = () => {
  fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    parseSRTContent(content)
  }
  reader.readAsText(file)
  
  // Reset the input
  event.target.value = ''
}

const parseSRTContent = (content) => {
  subtitles.value = []
  
  const blocks = content.split(/\n\s*\n/)
  
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue
    
    const timeLine = lines[1]
    const textLines = lines.slice(2)
    
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/)
    if (!timeMatch) continue
    
    const startTime = timeMatch[1].replace('.', ',')
    const endTime = timeMatch[2].replace('.', ',')
    
    subtitles.value.push({
      startTime,
      endTime,
      text: textLines.join('\n')
    })
  }
  
  if (subtitles.value.length > 0) {
    activeSubtitleIndex.value = 0
  }
}

const exportFile = () => {
  if (subtitles.value.length === 0) {
    alert('No subtitles to export')
    return
  }
  
  let srtContent = ''
  
  subtitles.value.forEach((subtitle, index) => {
    srtContent += `${index + 1}\n`
    srtContent += `${subtitle.startTime} --> ${subtitle.endTime}\n`
    srtContent += `${subtitle.text}\n\n`
  })
  
  const blob = new Blob([srtContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'subtitles.srt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Timeline interaction
const startDrag = (event) => {
  isDragging.value = true
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  handleDrag(event)
}

const handleDrag = (event) => {
  if (!isDragging.value || !timelineRef.value) return
  
  const rect = timelineRef.value.getBoundingClientRect()
  const dragX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  const percentage = (dragX / rect.width) * 100
  
  currentTimePosition.value = percentage
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Initialize with sample data
onMounted(() => {
  subtitles.value = [
    {
      startTime: '00:00:05,000',
      endTime: '00:00:10,000',
      text: 'Hello, welcome to this SRT editor.'
    },
    {
      startTime: '00:00:15,000',
      endTime: '00:00:20,000',
      text: 'You can edit subtitle text and timing here.'
    },
    {
      startTime: '00:00:25,000',
      endTime: '00:00:35,000',
      text: 'Import your own SRT files or create new subtitles from scratch.'
    }
  ]
})
</script>

<style scoped>
.srt-editor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #1e1e2e;
  color: #cdd6f4;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #313244;
}

.editor-header h1 {
  color: #f5c2e7;
  font-size: 2rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #cba6f7;
  color: #1e1e2e;
}

.btn-primary:hover:not(:disabled) {
  background: #b692f6;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #585b70;
  color: #cdd6f4;
}

.btn-secondary:hover {
  background: #6c7086;
}

.btn-danger {
  background: #f38ba8;
  color: #1e1e2e;
}

.btn-danger:hover {
  background: #eba0ac;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  height: calc(100vh - 150px);
}

.timeline-section {
  grid-column: 1 / -1;
  background: #313244;
  padding: 20px;
  border-radius: 12px;
}

.list-section {
  background: #313244;
  padding: 20px;
  border-radius: 12px;
  overflow-y: auto;
}

.editor-section {
  background: #313244;
  padding: 20px;
  border-radius: 12px;
  overflow-y: auto;
}

h2 {
  color: #f5c2e7;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

/* Timeline Styles */
.timeline-visual {
  background: #45475a;
  height: 80px;
  border-radius: 8px;
  position: relative;
  margin-bottom: 15px;
  overflow: hidden;
}

.timeline-track {
  position: relative;
  height: 100%;
  width: 100%;
}

.subtitle-block {
  position: absolute;
  height: 50px;
  background: #cba6f7;
  border-radius: 6px;
  top: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
}

.subtitle-block:hover {
  background: #b692f6;
  transform: scaleY(1.1);
}

.subtitle-block.active {
  background: #f5c2e7;
  box-shadow: 0 0 0 2px #f5c2e7;
}

.block-label {
  color: #1e1e2e;
  font-weight: 600;
  font-size: 0.8rem;
}

.timeline-marker {
  position: absolute;
  top: 0;
  width: 3px;
  height: 100%;
  background: #f5c2e7;
  cursor: grab;
  z-index: 10;
}

.timeline-marker:before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 11px;
  height: 11px;
  background: #f5c2e7;
  border-radius: 50%;
}

.time-display {
  text-align: center;
  font-family: monospace;
  font-size: 1.1rem;
  color: #a6adc8;
}

/* Subtitle List Styles */
.subtitle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subtitle-item {
  background: #45475a;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.subtitle-item:hover {
  background: #585b70;
  transform: translateX(2px);
}

.subtitle-item.active {
  border-left-color: #f5c2e7;
  background: #585b70;
}

.subtitle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.subtitle-number {
  font-weight: 600;
  color: #f5c2e7;
}

.subtitle-time {
  font-family: monospace;
  font-size: 0.9rem;
  color: #a6adc8;
}

.subtitle-text {
  line-height: 1.4;
  color: #cdd6f4;
}

/* Editor Form Styles */
.editor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
  color: #a6adc8;
}

input, textarea {
  padding: 12px;
  border: 1px solid #585b70;
  border-radius: 6px;
  background: #45475a;
  color: #cdd6f4;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #cba6f7;
}

.time-input {
  font-family: monospace;
}

textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.editor-actions .btn {
  flex: 1;
}

/* Empty States */
.empty-state, .empty-editor {
  text-align: center;
  padding: 40px 20px;
  color: #a6adc8;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state p, .empty-editor p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }
  
  .timeline-section {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
