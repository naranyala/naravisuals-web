<template>
  <div class="book-writer">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Book Draft Editor</h1>
        <p class="subtitle">Create and organize your book chapters</p>
      </div>

      <!-- Mode Switch -->
      <div class="mode-switch">
        <button :class="{ active: mode === 'editor' }" @click="mode = 'editor'">
          Editor
        </button>
        <button :class="{ active: mode === 'preview' }" @click="mode = 'preview'">
          Preview
        </button>
      </div>

      <!-- EDITOR MODE -->
      <div v-if="mode === 'editor'" class="editor-mode">
        <!-- Title -->
        <div class="field-group">
          <label>Book Title</label>
          <input v-model="book.title" type="text" placeholder="Enter your book title..." />
        </div>

        <!-- Chapters -->
        <div class="field-group">
          <div class="section-header">
            <label>Chapters ({{ book.chapters.length }})</label>
            <button class="primary" @click="addChapter">+ Add Chapter</button>
          </div>

          <div class="chapters-list">
            <div
              v-for="(ch, idx) in book.chapters"
              :key="idx"
              class="chapter-card"
            >
              <div class="chapter-header">
                <input
                  v-model="ch.title"
                  type="text"
                  :placeholder="`Chapter ${idx + 1} title...`"
                />
                <button class="danger" @click="removeChapter(idx)">Remove</button>
              </div>

              <textarea
                v-model="ch.content"
                class="chapter-content"
                placeholder="Write your chapter content here..."
                rows="6"
              ></textarea>
            </div>

            <div v-if="book.chapters.length === 0" class="empty-state">
              No chapters yet. Click "Add Chapter" to get started.
            </div>
          </div>
        </div>

        <!-- Import/Export -->
        <div class="field-group">
          <label>Import/Export</label>
          <div class="action-row">
            <button class="secondary" @click="exportJSON">Export JSON</button>
            <label class="upload-btn">
              Import JSON
              <input type="file" accept="application/json" @change="importJSON" />
            </label>
          </div>
        </div>

        <!-- JSON Preview -->
        <div class="field-group">
          <label>JSON Preview</label>
          <pre class="json-preview">{{ jsonPreview }}</pre>
        </div>
      </div>

      <!-- PREVIEW MODE -->
      <div v-else class="preview-mode">
        <h2 class="preview-title">{{ book.title || 'Untitled Book' }}</h2>

        <div class="preview-content">
          <div
            v-for="(ch, idx) in book.chapters"
            :key="idx"
            class="preview-chapter"
          >
            <h3>{{ ch.title || `Chapter ${idx + 1}` }}</h3>
            <p>{{ ch.content || 'No content yet.' }}</p>
            <hr v-if="idx < book.chapters.length - 1" />
          </div>

          <div v-if="book.chapters.length === 0" class="empty-state">
            No chapters to preview. Switch to Editor mode to add content.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const mode = ref('editor')

const book = reactive({
  title: '',
  chapters: []
})

function addChapter() {
  book.chapters.push({ title: '', content: '' })
}

function removeChapter(index) {
  book.chapters.splice(index, 1)
}

const jsonPreview = ref('')
watch(
  book,
  () => {
    jsonPreview.value = JSON.stringify(book, null, 2)
  },
  { deep: true }
)

function exportJSON() {
  const data = JSON.stringify(book, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${book.title || 'draft'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importJSON(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result)
      book.title = data.title || ''
      book.chapters = Array.isArray(data.chapters) ? data.chapters : []
    } catch (err) {
      alert('Invalid JSON file')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
/* Dark theme variables */
:root {
  --bg-color: #0a0a0a;
  --panel-bg: #1a1a1a;
  --card-bg: #0f0f0f;
  --text-color: #e5e5e5;
  --text-muted: #a1a1a1;
  --border-color: #2a2a2a;
  --button-bg: #2a2a2a;
  --button-hover-bg: #3a3a3a;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
}

.book-writer {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 1.5rem;
}

.container {
  max-width: 64rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.header {
  margin-bottom: 0.5rem;
}

.header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Mode Switch */
.mode-switch {
  display: flex;
  gap: 0.5rem;
  background: var(--panel-bg);
  padding: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.mode-switch button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.mode-switch button.active {
  background: #404040;
  color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.mode-switch button:hover:not(.active) {
  color: #e5e5e5;
  background: #2a2a2a;
}

/* Field Groups */
.field-group {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.field-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #d4d4d4;
  margin-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header label {
  margin-bottom: 0;
}

/* Inputs */
input[type="text"],
textarea {
  width: 100%;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s;
}

input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input[type="text"]::placeholder,
textarea::placeholder {
  color: #525252;
}

textarea {
  resize: vertical;
  line-height: 1.5;
}

/* Buttons */
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

button.primary {
  background: var(--primary-color);
  color: white;
}

button.primary:hover {
  background: var(--primary-hover);
}

button.secondary {
  background: var(--button-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

button.secondary:hover {
  background: var(--button-hover-bg);
}

button.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

button.danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Chapters List */
.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chapter-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.chapter-header input {
  flex: 1;
}

.chapter-header button {
  flex-shrink: 0;
}

.chapter-content {
  margin: 0;
}

/* Action Row */
.action-row {
  display: flex;
  gap: 0.75rem;
}

.action-row button,
.upload-btn {
  flex: 1;
}

.upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--button-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: var(--button-hover-bg);
}

.upload-btn input[type="file"] {
  display: none;
}

/* JSON Preview */
.json-preview {
  width: 100%;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: #a1a1a1;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #737373;
  font-size: 0.875rem;
}

/* Preview Mode */
.preview-mode {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 2rem;
}

.preview-title {
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
  color: #f5f5f5;
  margin: 0 0 2rem 0;
}

.preview-content {
  max-width: 48rem;
  margin: 0 auto;
}

.preview-chapter {
  margin-bottom: 2rem;
}

.preview-chapter h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0 0 1rem 0;
}

.preview-chapter p {
  color: var(--text-muted);
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

.preview-chapter hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 2rem 0;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .book-writer {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .field-group {
    padding: 1rem;
  }

  .chapter-header {
    flex-direction: column;
  }

  .chapter-header button {
    width: 100%;
  }

  .action-row {
    flex-direction: column;
  }

  .preview-mode {
    padding: 1.5rem;
  }

  .preview-title {
    font-size: 1.75rem;
  }

  .preview-chapter h3 {
    font-size: 1.25rem;
  }
}
</style>
