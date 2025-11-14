<!-- SearchBar.vue -->
<template>
  <div class="search-bar">
    <select v-model="selectedEngine" class="search-select">
      <option v-for="engine in searchEngines" :key="engine.name" :value="engine.name">
        {{ engine.name }}
      </option>
    </select>
    <input
      v-model="query"
      type="text"
      placeholder="Search the web..."
      class="search-input"
      @keyup.enter="performSearch"
    />
    <button @click="performSearch" class="search-button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span class="button-text">Search</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Define search engines with their names and base URLs
const searchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=%s' },
  { name: 'Twitter', url: 'https://twitter.com/search?q=%s' },
  { name: 'Github', url: 'https://github.com/search?q=%s&type=repositories' },
  { name: 'Hacker News', url: 'https://hn.algolia.com/?q=%s'},
  { name: 'Reddit', url: 'https://www.reddit.com/search/?q=%s' },
]

// Reactive state for selected engine and search query
const selectedEngine = ref('Google')
const query = ref('')

// Function to perform the search
const performSearch = () => {
  if (!query.value.trim()) return // Prevent empty searches
  
  // Find the selected engine's URL
  const engine = searchEngines.find(e => e.name === selectedEngine.value)
  if (engine) {
    // Encode the query and redirect to the search URL
    const searchQuery = encodeURIComponent(query.value);
    const searchUrl = engine.url.replace('%s', searchQuery)
    window.open(searchUrl, '_blank') // Open in new tab
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 700px;
  margin: 20px auto;
  padding: 0 16px 150px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.search-select {
  padding: 12px 30px 12px 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 15px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: calc(100% - 8px);
  background-position-y: center;
  min-width: 110px;
  flex-shrink: 0;
}

.search-select:focus {
  outline: none;
  border-color: #6200ea;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 15px;
}

.search-input::placeholder {
  color: #888;
}

.search-input:focus {
  outline: none;
  border-color: #6200ea;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  background: #6200ea;
  color: #e0e0e0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.search-button:hover {
  background: #7f39fb;
}

.search-button:active {
  transform: scale(0.98);
}

.search-button svg {
  stroke: #e0e0e0;
  flex-shrink: 0;
}

/* Mobile-first styling applied to all screens */
.search-bar {
  gap: 8px;
  padding: 0 12px 200px;
  margin: 16px auto;
}

.search-select {
  min-width: 90px;
  padding: 10px 28px 10px 8px;
  font-size: 14px;
}

.search-input {
  padding: 10px;
  font-size: 14px;
}

.search-button {
  padding: 10px 16px;
  font-size: 14px;
  min-height: 44px;
}

.button-text {
  display: none;
}

.search-button svg {
  width: 18px;
  height: 18px;
}

.search-select,
.search-input {
  min-height: 44px;
}
</style>
