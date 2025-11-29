<template>
  <div class="markdown-reader">
      <!-- Navigation Controls -->
    <div class="navigation">
      <button
        v-if="hasPrev"
        @click="goToPrev"
        :disabled="!hasPrev"
      >
        ← Previous
      </button>
      <span class="current">{{ currentFile.title }}</span>
      <button
        v-if="hasNext"
        @click="goToNext"
        :disabled="!hasNext"
      >
        Next →
      </button>
    </div>

    <!-- Markdown Content -->
    <div
      class="content"
      v-html="renderedMarkdown"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'

// Import all markdown files (adjust path as needed)
const markdownModules = import.meta.glob('../articles/**/*.md', { eager: true })

// State
const currentPath = ref('')
const markdownContent = ref('')

// Process imported files
const files = computed(() => {
  return Object.entries(markdownModules)
    .map(([path, module]) => {
      // Extract filename without extension for title
      const name = path.split('/').pop().replace('.md', '')
      return {
        path,
        title: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        content: module.default || ''
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title)) // Optional: sort alphabetically
})

// Current file index
const currentIndex = computed(() => {
  return files.value.findIndex(file => file.path === currentPath.value)
})

// Navigation helpers
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < files.value.length - 1)

// Navigation methods
const goToPrev = () => {
  if (hasPrev.value) {
    currentPath.value = files.value[currentIndex.value - 1].path
  }
}

const goToNext = () => {
  if (hasNext.value) {
    currentPath.value = files.value[currentIndex.value + 1].path
  }
}

// Get current file object
const currentFile = computed(() => {
  return files.value.find(file => file.path === currentPath.value) || {}
})

// Render markdown to HTML
const renderedMarkdown = computed(() => {
  return marked(currentFile.value.content || '')
})

// Initialize with first file
onMounted(() => {
  if (files.value.length > 0) {
    currentPath.value = files.value[0].path
  }
})
</script>

<style scoped>
.markdown-reader {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 10px 0;
}

.navigation button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.navigation button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.navigation .current {
  font-weight: bold;
  font-size: 1.2rem;
}

.content {
  line-height: 1.6;
}

/* Basic Markdown styling */
.content h1 { font-size: 2rem; margin-top: 1.5em; }
.content h2 { font-size: 1.5rem; margin-top: 1.2em; }
.content h3 { font-size: 1.2rem; margin-top: 1em; }
.content p { margin: 0.8em 0; }
.content ul, .content ol { margin: 0.8em 0; padding-left: 20px; }
.content code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
</style>
