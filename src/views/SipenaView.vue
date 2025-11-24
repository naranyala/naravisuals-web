<template>
  <div class="book-writer">
    <!-- Header -->
    <div class="header">
      <h1>Book Draft</h1>
      <div class="controls">
        <button @click="isPreview = !isPreview" class="mode-btn">
          {{ isPreview ? 'Edit' : 'Preview' }}
        </button>
        <button @click="addChapter">+ Chapter</button>
        <button @click="exportToJson">Export</button>
        <button @click="importFromJson">Import</button>
        <input ref="fileInput" type="file" @change="handleFileImport" accept=".json" class="hidden" />
        <button @click="clearAll" class="clear-btn">Clear</button>
      </div>
    </div>

    <!-- Book Info -->
    <div v-if="!isPreview" class="book-info">
      <input v-model="book.title" placeholder="Book Title" />
      <input v-model="book.author" placeholder="Author" />
      <textarea v-model="book.description" placeholder="Description" />
    </div>

    <!-- Chapters -->
    <div class="chapters">
      <div v-for="(chapter, index) in book.chapters" :key="chapter.id" class="chapter">
        <div v-if="!isPreview" class="editor">
          <div class="chapter-header">
            <input v-model="chapter.title" :placeholder="`Chapter ${index + 1}`" />
            <div class="actions">
              <button @click="moveChapter(index, -1)" :disabled="index === 0">↑</button>
              <button @click="moveChapter(index, 1)" :disabled="index === book.chapters.length - 1">↓</button>
              <button @click="removeChapter(index)" class="delete">×</button>
            </div>
          </div>
          <textarea v-model="chapter.content" placeholder="Start writing..." />
          <div class="stats">Words: {{ countWords(chapter.content) }}</div>
        </div>

        <div v-else class="preview">
          <h3>{{ chapter.title || `Chapter ${index + 1}` }}</h3>
          <pre>{{ chapter.content }}</pre>
        </div>
      </div>
    </div>

    <!-- Status -->
    <div class="status">
      <span>Saved: {{ lastSaved }}</span>
      <span>Total: {{ totalWords }} words</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const book = ref({
  title: '',
  author: '',
  description: '',
  chapters: []
})

const fileInput = ref(null)
const lastSaved = ref('Never')
const isPreview = ref(true)

const totalWords = computed(() => {
  return book.value.chapters.reduce((total, chapter) => total + countWords(chapter.content), 0)
})

const countWords = (text) => text.trim() ? text.trim().split(/\s+/).length : 0

const clearAll = () => {
  if (confirm('Clear everything and start from scratch?')) {
    book.value = {
      title: '',
      author: '',
      description: '',
      chapters: []
    }
    addChapter() // Add empty first chapter
    updateLastSaved()
  }
}

const addChapter = () => {
  book.value.chapters.push({
    id: Date.now().toString(),
    title: '',
    content: '',
    createdAt: new Date().toISOString()
  })
}

const removeChapter = (index) => {
  if (confirm('Delete chapter?')) {
    book.value.chapters.splice(index, 1)
  }
}

const moveChapter = (index, direction) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < book.value.chapters.length) {
    [book.value.chapters[index], book.value.chapters[newIndex]] = 
    [book.value.chapters[newIndex], book.value.chapters[index]]
  }
}

const exportToJson = () => {
  const data = JSON.stringify(book.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${book.value.title || 'book'}.json`
  a.click()
  URL.revokeObjectURL(url)
  updateLastSaved()
}

const importFromJson = () => fileInput.value?.click()

const handleFileImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data && typeof data === 'object') {
        book.value = {
          title: data.title || '',
          author: data.author || '',
          description: data.description || '',
          chapters: Array.isArray(data.chapters) ? data.chapters : []
        }
        updateLastSaved()
      }
    } catch {
      alert('Invalid JSON file')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

const updateLastSaved = () => {
  lastSaved.value = new Date().toLocaleTimeString()
}

// Auto-save
const STORAGE_KEY = 'book-draft'
const saveToLocalStorage = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(book.value))
const loadFromLocalStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) book.value = JSON.parse(saved)
}

watch(book, saveToLocalStorage, { deep: true })
onMounted(() => {
  loadFromLocalStorage()
  if (book.value.chapters.length === 0) addChapter()
})
</script>

<style>
.book-writer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1a1a;
  color: #e0e0e0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
}

.header {
  /* display: flex; */
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 30px;
  border-bottom: 1px solid #333;
  text-align: center;

  h1 { padding-bottom: 20px; }
}

h1 {
  margin: 0;
  color: #fff;
}

.controls {
  /* display: grid; */
  width: auto;
  /* gap: 8px; */
  button { margin: 4px; }
}

button {
  padding: 6px 12px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #3a3a3a;
}

.clear-btn {
  background: #8a2a2a;
}

.mode-btn {
  background: #4a4a8a;
}

.book-info {
  margin-bottom: 20px;
}

input, textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 4px;
}

textarea {
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
}

.chapter {
  margin-bottom: 20px;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
}

.actions {
  display: flex;
  gap: 4px;
}

.delete {
  background: #8a2a2a;
}

.stats {
  padding: 8px 10px;
  background: #2a2a2a;
  border-top: 1px solid #333;
  font-size: 0.9em;
  color: #888;
}

.preview {
  padding: 15px;
}

.preview h3 {
  margin: 0 0 10px 0;
  color: #fff;
}

.preview pre {
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.5;
}

.status {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #333;
  font-size: 0.9em;
  color: #888;
}

.hidden {
  display: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
