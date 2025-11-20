<template>
  <div class="file-upload">
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelect"
      class="file-input"
    />
    
    <div
      class="upload-area"
      :class="{
        'is-dragover': isDragOver,
        'has-files': files.length > 0
      }"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div v-if="files.length === 0" class="upload-placeholder">
        <div class="upload-icon">📁</div>
        <p class="upload-text">Drag & drop files here or click to browse</p>
        <p v-if="accept" class="upload-hint">Accepted formats: {{ accept }}</p>
      </div>
      
      <div v-else class="file-list">
        <div
          v-for="file in files"
          :key="file.id"
          class="file-item"
        >
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <button
              v-if="file.previewUrl"
              @click.stop="previewFile(file)"
              class="action-button"
            >
              👁️
            </button>
            <button
              @click.stop="removeFile(file.id)"
              class="action-button remove"
            >
              ×
            </button>
          </div>
          <div v-if="file.progress !== undefined" class="upload-progress">
            <div
              class="progress-bar"
              :style="{ width: `${file.progress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  }
})

const emit = defineEmits(['update:modelValue', 'file-added', 'file-removed'])

const fileInput = ref(null)
const isDragOver = ref(false)
let nextFileId = 1

const files = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  processFiles(selectedFiles)
  event.target.value = '' // Reset input
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const droppedFiles = Array.from(event.dataTransfer.files)
  processFiles(droppedFiles)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const processFiles = (newFiles) => {
  const validFiles = newFiles.filter(file => {
    if (file.size > props.maxSize) {
      console.warn(`File ${file.name} exceeds maximum size`)
      return false
    }
    return true
  })

  const processedFiles = validFiles.map(file => ({
    id: nextFileId++,
    file: file,
    name: file.name,
    size: file.size,
    type: file.type,
    progress: 0,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  }))

  if (props.multiple) {
    files.value = [...files.value, ...processedFiles]
  } else {
    files.value = processedFiles.slice(0, 1)
  }

  processedFiles.forEach(processedFile => {
    emit('file-added', processedFile)
  })
}

const removeFile = (fileId) => {
  const fileToRemove = files.value.find(f => f.id === fileId)
  files.value = files.value.filter(f => f.id !== fileId)
  
  if (fileToRemove?.previewUrl) {
    URL.revokeObjectURL(fileToRemove.previewUrl)
  }
  
  emit('file-removed', fileToRemove)
}

const previewFile = (file) => {
  if (file.previewUrl) {
    window.open(file.previewUrl, '_blank')
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Simulate upload progress
const simulateUpload = (fileId) => {
  const file = files.value.find(f => f.id === fileId)
  if (!file) return

  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 10
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
    }
    
    file.progress = progress
    files.value = [...files.value] // Trigger reactivity
  }, 200)
}
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.upload-area.is-dragover {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.upload-area.has-files {
  padding: 20px;
}

.upload-placeholder {
  color: #6b7280;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #9ca3af;
}

.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.action-button:hover {
  background-color: #f3f4f6;
}

.action-button.remove:hover {
  background-color: #fef2f2;
  color: #ef4444;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #f3f4f6;
}

.progress-bar {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}
</style>
