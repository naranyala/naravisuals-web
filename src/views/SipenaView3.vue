<template>
  <div class="editor">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="tabs">
          <button :class="{ active: mode === 'editor' }" @click="mode = 'editor'">
            Edit
          </button>
          <button :class="{ active: mode === 'preview' }" @click="mode = 'preview'">
            Preview
          </button>
        </div>
        <div class="actions">
          <button @click="importBook" :disabled="isImporting">Import</button>
          <button @click="exportBook" :disabled="!hasContent">Export</button>
          <button @click="clearBook" :disabled="!hasContent">Clear</button>
        </div>
      </div>

      <!-- Editor -->
      <div v-if="mode === 'editor'">
        <input
          v-model="book.title"
          placeholder="Book Title"
          class="title"
        />

        <div class="chapters">
          <div v-for="(ch, i) in book.chapters" :key="i" class="chapter">
            <div class="row">
              <input
                v-model="ch.title"
                :placeholder="`Chapter ${i + 1}`"
                class="chapter-title"
              />
              <button
                @click="removeChapter(i)"
                :disabled="book.chapters.length === 1"
                class="remove"
              >
                ×
              </button>
            </div>
            <textarea
              v-model="ch.content"
              placeholder="Write here..."
              class="content"
            />
          </div>
        </div>

        <button @click="addChapter" class="add">+ Chapter</button>
      </div>

      <!-- Preview -->
      <div v-else class="preview">
        <h1>{{ book.title || 'Untitled' }}</h1>
        <div v-for="(ch, i) in book.chapters" :key="i" class="chapter-preview">
          <h2>{{ ch.title || `Chapter ${i + 1}` }}</h2>
          <p v-html="renderMarkdown(ch.content)"></p>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleFileImport"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const renderMarkdown = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
}

const mode = ref('editor')
const book = reactive({
  title: '',
  chapters: [{ title: '', content: '' }]
})
const fileInput = ref(null)
const isImporting = ref(false)

const hasContent = computed(() => {
  return book.title.trim() || book.chapters.some(ch => ch.title.trim() || ch.content.trim())
})

const addChapter = () => book.chapters.push({ title: '', content: '' })
const removeChapter = (i) => { if (book.chapters.length > 1) book.chapters.splice(i, 1) }

const clearBook = () => {
  if (confirm('Clear all?')) {
    book.title = ''
    book.chapters = [{ title: '', content: '' }]
    mode.value = 'editor'
  }
}

const exportBook = () => {
  const blob = new Blob([JSON.stringify(book, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'book.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importBook = () => fileInput.value.click()

const handleFileImport = (e) => {
  isImporting.value = true
  const file = e.target.files[0]
  if (!file) {
    isImporting.value = false
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      book.title = data.title || ''
      book.chapters = Array.isArray(data.chapters) ? data.chapters : [{ title: '', content: '' }]
      if (book.chapters.length === 0) book.chapters.push({ title: '', content: '' })
    } catch {
      alert('Invalid file')
    } finally {
      isImporting.value = false
      e.target.value = ''
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.editor {
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tabs button {
  background: none;
  border: none;
  padding: 8px 0;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  color: #fff;
  border-bottom-color: #fff;
}

.actions {
  display: flex;
  gap: 16px;
}

.actions button {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}

.actions button:hover:not(:disabled) {
  border-color: #fff;
}

.actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

input,
textarea {
  font-family: inherit;
  border: 1px solid #333;
  background: #000;
  color: #fff;
  width: 100%;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #fff;
}

.title {
  font-size: 32px;
  font-weight: 600;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #333;
  margin-bottom: 40px;
}

.chapters {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 24px;
}

.chapter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chapter-title {
  flex: 1;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
}

.remove {
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.remove:hover:not(:disabled) {
  border-color: #fff;
  color: #fff;
}

.remove:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.content {
  min-height: 150px;
  padding: 12px;
  font-size: 15px;
  line-height: 1.6;
  border-radius: 4px;
  resize: vertical;
}

.add {
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
}

.add:hover {
  background: #ddd;
}

.preview h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 48px;
  text-align: center;
}

.chapter-preview {
  margin-bottom: 48px;
}

.chapter-preview h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.chapter-preview p {
  font-size: 16px;
  line-height: 1.8;
  color: #ccc;
}

@media (max-width: 640px) {
  .container {
    padding: 24px 16px;
  }

  .header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .tabs,
  .actions {
    justify-content: center;
  }

  .title {
    font-size: 24px;
  }
}
</style>
