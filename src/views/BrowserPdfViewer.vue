<template>
  <div class="pdf-viewer">
    <!-- PDF Viewer -->
    <div v-if="pdfUrl" class="pdf-container">
      <div class="pdf-toolbar">
        <button @click="closePdf" class="close-btn">✕ Close PDF</button>
        <span v-if="fileName" class="file-name">{{ fileName }}</span>
      </div>
      <iframe :src="pdfUrl" class="pdf-iframe" @load="onPdfLoad" title="PDF Viewer"></iframe>
    </div>

    <!-- File Picker (only shown when no PDF is loaded) -->
    <div v-else class="file-picker">
      <label for="pdf-file" class="file-input-label">
        <span>Choose PDF file</span>
        <input type="file" id="pdf-file" accept=".pdf" @change="handleFileSelect" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-else-if="!props.pdfPath" class="hint">Or pass a PDF path via the `pdfPath` prop</p>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading">
      Loading PDF...
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  // Local PDF path (e.g., '/pdfs/document.pdf')
  pdfPath: {
    type: String,
    default: ''
  }
})

const pdfUrl = ref(null)
const fileName = ref('')
const loading = ref(false)
const error = ref(null)
let internalPdfUrl = null // For cleanup

// Handle prop changes
watch(() => props.pdfPath, (newPath) => {
  if (newPath) {
    loadLocalPdf(newPath)
  } else {
    // closePdf()
  }
}, { immediate: true })

const loadLocalPdf = (path) => {
  loading.value = true
  error.value = null
  fileName.value = path.split('/').pop()

  // For local assets, we can directly use the path
  pdfUrl.value = path
  // loading.value = false // ❌ removed; let onPdfLoad handle it
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Reset input so the same file can be re-selected
  event.target.value = ''

  // Reset state
  error.value = null
  loading.value = true

  if (file.type !== 'application/pdf') {
    error.value = 'Please select a valid PDF file'
    loading.value = false
    return
  }

  // Create object URL for user-selected file
  if (internalPdfUrl) {
    URL.revokeObjectURL(internalPdfUrl)
  }
  internalPdfUrl = URL.createObjectURL(file)
  pdfUrl.value = internalPdfUrl
  fileName.value = file.name
  // loading.value = false // ❌ removed; let onPdfLoad handle it
}

const closePdf = () => {
  if (internalPdfUrl) {
    URL.revokeObjectURL(internalPdfUrl)
    internalPdfUrl = null
  }
  pdfUrl.value = null
  fileName.value = ''
  error.value = null
}

const onPdfLoad = () => {
  loading.value = false
}

// Cleanup on unmount
onUnmounted(() => {
  if (internalPdfUrl) {
    URL.revokeObjectURL(internalPdfUrl)
  }
})
</script>

<style scoped>
.pdf-viewer {
  /* ✅ fixed typo */
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.pdf-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-toolbar {
  padding: 12px 16px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #ccc;
}

.close-btn {
  background: #e43d3d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #c22a2a;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.pdf-iframe {
  flex: 1;
  width: 100%;
  border: none;
}

.file-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.file-input-label {
  display: inline-block;
  padding: 12px 24px;
  background: #42b883;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.file-input-label:hover {
  background: #359b6a;
}

.file-input-label input[type="file"] {
  display: none;
}

.error {
  color: #e43d3d;
  font-size: 14px;
}

.hint {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 16px;
  border-radius: 4px;
  z-index: 10;
}
</style>
