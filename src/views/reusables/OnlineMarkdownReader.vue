<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/tokyo-night-dark.css'

// === CONFIG: Your Markdown files from GitHub ===
// const sources = [
//   {
//     title: 'modular-dotfiles README',
//     url: 'https://raw.githubusercontent.com/naranyala/modular-dotfiles/refs/heads/main/README.md'
//   },
//   {
//     title: 'naravisuals-web README',
//     url: 'https://raw.githubusercontent.com/naranyala/naravisuals-web/refs/heads/main/README.md'
//   },
//   {
//     title: "sample article",
//     url: "https://raw.githubusercontent.com/naranyala/naravisuals-web/refs/heads/main/src/articles/01-02-system-computer.md"
//   }
// ]


const props = defineProps({ 
  sources: { type: Array, required: true }
})

const sources = ref(props?.sources || [])

const pages = ref([])
const loading = ref(true)
const activePane = ref(0)
// const viewMode = ref('multi') // 'multi' or 'single'
const viewMode = ref('multi') // 'multi' or 'single'
const searchQuery = ref('')

onMounted(() => {
  viewMode.value = 'single'
})

marked.setOptions({
  highlight: (code, lang) => hljs.highlightAuto(code).value,
  gfm: true,
  breaks: true
})

const load = async () => {
  loading.value = true
  pages.value = sources.value.map(s => ({ ...s, html: '', error: false }))

  await Promise.all(sources.value.map(async (s, i) => {
    try {
      const res = await fetch(`${s.url}?t=${Date.now()}`)
      const text = await res.text()
      pages.value[i].html = marked(text)
    } catch {
      pages.value[i].error = true
      pages.value[i].html = '<p class="error-message">Failed to load content</p>'
    }
  }))
  loading.value = false
}

const setActivePane = (index) => {
  activePane.value = index
  if (viewMode.value === 'single') {
    // Scroll to the active pane in single view mode
    const element = document.getElementById(`pane-${index}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'multi' ? 'single' : 'multi'
}

const filteredPages = computed(() => {
  if (!searchQuery.value) return pages.value
  return pages.value.filter(page => 
    page.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    page.html.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(load)
</script>

<template>
  <div class="app" :class="[viewMode]">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <!-- <div class="logo-section"> -->
        <!--   <div class="logo"> -->
        <!--     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> -->
        <!--       <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> -->
        <!--       <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> -->
        <!--       <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> -->
        <!--     </svg> -->
        <!--   </div> -->
        <!--   <div class="title"> -->
        <!--     <h1>Documentation</h1> -->
        <!--     <p>Complete project documentation</p> -->
        <!--   </div> -->
        <!-- </div> -->
        
        <div class="controls">
          <!-- <div class="search-box"> -->
          <!--   <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="search-icon"> -->
          <!--     <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/> -->
          <!--   </svg> -->
          <!--   <input  -->
          <!--     v-model="searchQuery" -->
          <!--     type="text"  -->
          <!--     placeholder="Search documentation..."  -->
          <!--     class="search-input" -->
          <!--   > -->
          <!-- </div> -->
          
          <div class="view-controls">
            <button 
              @click="toggleViewMode" 
              class="view-toggle"
              :class="{ active: viewMode === 'multi' }"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2V2zm1 1v10h4V3H3zm5 0v10h4V3H8z"/>
              </svg>
              Multi-view
            </button>
            <button 
              @click="toggleViewMode" 
              class="view-toggle"
              :class="{ active: viewMode === 'single' }"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z"/>
              </svg>
              Single-view
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <!-- Loading State -->
      <div v-if="loading" class="loading-grid">
        <div v-for="n in 5" :key="n" class="loading-pane">
          <div class="loading-header"></div>
          <div class="loading-content">
            <div v-for="i in 4" :key="i" class="loading-line" :style="{ width: 60 + Math.random() * 30 + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Multi-view Layout -->
      <div v-else-if="viewMode === 'multi'" class="multi-view">
        <div class="panes-grid">
          <article 
            v-for="(page, index) in filteredPages" 
            :key="index"
            :class="{ active: activePane === index }"
            class="pane"
            @click="setActivePane(index)"
          >
            <header class="pane-header">
              <h2>{{ page.title }}</h2>
              <div class="pane-actions">
                <button class="action-btn" @click.stop="setActivePane(index)">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3zm0 6a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3zm-6 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3z"/>
                  </svg>
                </button>
              </div>
            </header>
            <div class="pane-content">
              <div v-html="page.html" class="md-preview"></div>
            </div>
            <footer class="pane-footer">
              <span class="page-number">{{ index + 1 }} / {{ pages.length }}</span>
            </footer>
          </article>
        </div>
      </div>

      <!-- Single-view Layout -->
      <div v-else class="single-view">
        <nav class="single-nav">
          <button 
            v-for="(page, index) in filteredPages" 
            :key="index"
            @click="setActivePane(index)"
            :class="{ active: activePane === index }"
            class="single-nav-item"
          >
            <span class="nav-title">{{ page.title }}</span>
            <div class="nav-indicator"></div>
          </button>
        </nav>

        <div class="single-content">
          <article 
            v-for="(page, index) in filteredPages" 
            :key="index"
            :id="`pane-${index}`"
            :class="{ active: activePane === index }"
            class="single-pane"
          >
            <header class="single-pane-header">
              <h1>{{ page.title }}</h1>
              <!-- <div class="pagination"> -->
              <!--   <button  -->
              <!--     v-if="index > 0" -->
              <!--     @click="setActivePane(index - 1)" -->
              <!--     class="pagination-btn prev" -->
              <!--   > -->
              <!--     <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"> -->
              <!--       <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/> -->
              <!--     </svg> -->
              <!--     Previous -->
              <!--   </button> -->
              <!--   <span class="page-info">{{ index + 1 }} of {{ pages.length }}</span> -->
              <!--   <button  -->
              <!--     v-if="index < pages.length - 1" -->
              <!--     @click="setActivePane(index + 1)" -->
              <!--     class="pagination-btn next" -->
              <!--   > -->
              <!--     Next -->
              <!--     <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"> -->
              <!--       <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/> -->
              <!--     </svg> -->
              <!--   </button> -->
              <!-- </div> -->
            </header>
            <div v-html="page.html" class="md-full"></div>
          </article>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <a href="https://github.com/gema-naranyala" target="_blank" class="github-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"/>
          </svg>
          @gema_naranyala
        </a>
        <div class="footer-info">
          {{ filteredPages.length }} of {{ pages.length }} documents
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-tertiary: #1a1a1a;
  --bg-card: rgba(20, 20, 20, 0.8);
  --bg-glass: rgba(15, 15, 15, 0.9);
  --fg-primary: #fafafa;
  --fg-secondary: #b0b0b0;
  --fg-tertiary: #666666;
  --accent-primary: #00ff88;
  --accent-secondary: #00cc6d;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-light: rgba(255, 255, 255, 0.05);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 16px 50px rgba(0, 0, 0, 0.4);
}

* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
}

body { 
  background: var(--bg-primary); 
  color: var(--fg-primary); 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
  line-height: 1.6;
}

.app {
  min-height: 100dvh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: var(--bg-glass);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
}

.title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--fg-primary);
  letter-spacing: -0.25px;
  margin-bottom: 0.25rem;
}

.title p {
  font-size: 0.9rem;
  color: var(--fg-secondary);
}

.controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--fg-tertiary);
}

.search-input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: var(--fg-primary);
  font-size: 0.9rem;
  width: 280px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.view-controls {
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--fg-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle.active {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.view-toggle:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--fg-primary);
}

/* Main Content */
.main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}

/* Loading State */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading-pane {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.loading-header {
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

.loading-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-line {
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: pulse 2s infinite;
}

/* Multi-view Layout */
.multi-view {
  width: 100%;
}

.panes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.pane {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.pane:hover {
  border-color: var(--border-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pane.active {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary), var(--shadow-md);
}

.pane-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.pane-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--fg-primary);
  margin: 0;
}

.pane-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: var(--fg-tertiary);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--fg-primary);
}

.pane-content {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
  max-height: 400px;
}

.pane-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-number {
  font-size: 0.8rem;
  color: var(--fg-tertiary);
  font-weight: 500;
}

/* Single-view Layout */
.single-view {
  display: flex;
  gap: 2rem;
  min-height: 600px;
}

.single-nav {
  width: 250px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.single-nav-item {
  background: none;
  border: none;
  text-align: left;
  padding: 1rem 1.25rem;
  color: var(--fg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.single-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--fg-primary);
}

.single-nav-item.active {
  background: rgba(0, 255, 136, 0.1);
  color: var(--accent-primary);
  font-weight: 600;
}

.nav-indicator {
  width: 4px;
  height: 16px;
  background: var(--accent-primary);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.single-nav-item.active .nav-indicator {
  opacity: 1;
}

.single-content {
  flex: 1;
}

.single-pane {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  backdrop-filter: blur(10px);
  display: none;
}

.single-pane.active {
  display: block;
  animation: fadeInUp 0.4s ease;
}

.single-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.single-pane-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--fg-primary);
  letter-spacing: -0.5px;
  margin: 0;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--fg-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
}

.page-info {
  font-size: 0.9rem;
  color: var(--fg-secondary);
  font-weight: 500;
}

/* Markdown Styles */
.md-preview {
  font-size: 0.9rem;
  line-height: 1.6;
}

.md-preview :deep(h1) { 
  font-size: 1.4rem; 
  margin: 1.5rem 0 1rem; 
  color: var(--fg-primary); 
  font-weight: 600;
}

.md-preview :deep(h2) { 
  font-size: 1.2rem; 
  margin: 1.25rem 0 0.75rem; 
  color: var(--accent-primary); 
  font-weight: 600; 
}

.md-preview :deep(h3) { 
  font-size: 1.1rem; 
  margin: 1rem 0 0.5rem; 
  color: var(--fg-primary); 
}

.md-preview :deep(p) { 
  margin: 0.75rem 0; 
  color: var(--fg-secondary);
}

.md-preview :deep(code) { 
  background: var(--bg-tertiary); 
  padding: 0.15em 0.3em; 
  border-radius: var(--radius-sm); 
  font-size: 0.85em; 
  color: var(--accent-primary);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.md-preview :deep(pre) { 
  background: var(--bg-tertiary); 
  padding: 1rem; 
  border-radius: var(--radius-md); 
  overflow-x: auto; 
  border: 1px solid var(--border-color);
  margin: 1rem 0;
}

.md-preview :deep(a) { 
  color: var(--accent-primary); 
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.md-preview :deep(a:hover) {
  border-bottom: 1px solid var(--accent-primary);
}

.md-preview :deep(ul), .md-preview :deep(ol) { 
  padding-left: 1.25rem; 
  margin: 0.75rem 0; 
}

.md-preview :deep(li) { 
  margin: 0.25rem 0; 
  color: var(--fg-secondary);
}

.md-preview :deep(blockquote) { 
  border-left: 3px solid var(--accent-primary); 
  padding-left: 1rem; 
  color: var(--fg-secondary); 
  margin: 1rem 0; 
  font-style: italic;
}

/* Full Markdown Styles */
.md-full {
  font-size: 1.05rem;
  line-height: 1.7;
}

.md-full :deep(h1) { 
  font-size: 2.25rem; 
  margin: 2.5rem 0 1.5rem; 
  color: var(--fg-primary); 
  font-weight: 700;
  letter-spacing: -0.5px;
}

.md-full :deep(h2) { 
  font-size: 1.75rem; 
  margin: 2.5rem 0 1rem; 
  color: var(--accent-primary); 
  font-weight: 600; 
  letter-spacing: -0.25px;
}

.md-full :deep(h3) { 
  font-size: 1.35rem; 
  margin: 2rem 0 0.8rem; 
  color: var(--fg-primary); 
  font-weight: 600;
}

.md-full :deep(p) { 
  margin: 1.25rem 0; 
  color: var(--fg-secondary);
}

.md-full :deep(code) { 
  background: var(--bg-tertiary); 
  padding: 0.2em 0.4em; 
  border-radius: var(--radius-sm); 
  font-size: 0.9em; 
  color: var(--accent-primary);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.md-full :deep(pre) { 
  background: var(--bg-tertiary); 
  padding: 1.5rem; 
  border-radius: var(--radius-md); 
  overflow-x: auto; 
  border: 1px solid var(--border-color);
  margin: 1.5rem 0;
}

.md-full :deep(a) { 
  color: var(--accent-primary); 
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.md-full :deep(a:hover) {
  border-bottom: 1px solid var(--accent-primary);
}

.md-full :deep(ul), .md-full :deep(ol) { 
  padding-left: 1.5rem; 
  margin: 1.25rem 0; 
}

.md-full :deep(li) { 
  margin: 0.5rem 0; 
  color: var(--fg-secondary);
}

.md-full :deep(blockquote) { 
  border-left: 3px solid var(--accent-primary); 
  padding-left: 1.25rem; 
  color: var(--fg-secondary); 
  margin: 1.5rem 0; 
  font-style: italic;
}

.error-message {
  color: #ff6b6b;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: var(--radius-md);
  text-align: center;
}

/* Footer */
.footer {
  background: var(--bg-glass);
  border-top: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.github-link {
  color: var(--fg-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
  font-size: 0.9rem;
}

.github-link:hover {
  color: var(--accent-primary);
}

.footer-info {
  font-size: 0.85rem;
  color: var(--fg-tertiary);
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .controls {
    justify-content: space-between;
  }
  
  .search-input {
    width: 240px;
  }
  
  .panes-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .single-view {
    flex-direction: column;
  }
  
  .single-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .single-nav-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .view-controls {
    align-self: stretch;
    justify-content: center;
  }
  
  .panes-grid {
    grid-template-columns: 1fr;
  }
  
  .pane {
    max-height: 500px;
  }
  
  .single-pane {
    padding: 1.5rem;
  }
  
  .single-pane-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .pagination {
    width: 100%;
    justify-content: space-between;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.75rem;
  }
  
  .main {
    padding: 0.75rem;
  }
  
  .logo-section {
    gap: 0.75rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .title h1 {
    font-size: 1.25rem;
  }
  
  .title p {
    font-size: 0.8rem;
  }
  
  .pane-header,
  .pane-content,
  .pane-footer {
    padding: 1rem;
  }
  
  .single-pane {
    padding: 1rem;
  }
}
</style>
