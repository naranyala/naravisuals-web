<script setup>
import { ref } from 'vue'

// Define search engines with their names and base URLs
const searchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { name: 'Images', url: 'https://www.google.com/search?tbm=isch&q=%s'},
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

<template>
  <div class="search-container">
    <!-- Line 1: Engine selector -->
    <div class="search-line">
      <select v-model="selectedEngine" class="search-select">
        <option v-for="engine in searchEngines" :key="engine.name" :value="engine.name">
          {{ engine.name }}
        </option>
      </select>
    </div>

    <!-- Line 2: Search input -->
    <div class="search-line">
      <input
        v-model="query"
        type="text"
        placeholder="Search the web..."
        class="search-input"
        @keyup.enter="performSearch"
      />
    </div>

    <!-- Line 3: Search button -->
    <div class="search-line">
      <button @click="performSearch" class="search-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  margin: 20px auto;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.search-line {
  display: flex;
  width: 100%;
}

.search-select {
  width: 100%;
  padding: 14px 40px 14px 14px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 16px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: calc(100% - 12px);
  background-position-y: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-select:hover {
  border-color: #6200ea;
  background-color: #333;
}

.search-select:focus {
  outline: none;
  border-color: #6200ea;
  box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.1);
}

.search-input {
  width: 100%;
  padding: 14px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #888;
}

.search-input:hover {
  border-color: #6200ea;
  background-color: #333;
}

.search-input:focus {
  outline: none;
  border-color: #6200ea;
  box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.1);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #6200ea 0%, #7f39fb 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #7f39fb 0%, #9c4dff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(98, 0, 234, 0.4);
}

.search-button:active {
  transform: translateY(0) scale(0.98);
}

.search-button svg {
  stroke: currentColor;
  flex-shrink: 0;
}

.button-text {
  font-weight: 600;
}

</style>
