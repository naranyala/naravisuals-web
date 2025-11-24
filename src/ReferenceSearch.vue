<template>
  <div class="search-container">
    <h2>Dynamic Search</h2>

    <input
      type="text"
      v-model="searchQuery"
      @keyup.enter="openSearchUrl"
      placeholder="Enter your search term (e.g., 'pagination library')"
      class="search-input"
    />

    <p class="url-display">
      **Generated URL:**<br />
      <a
        :href="generatedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="url-link"
      >
        {{ generatedUrl }}
      </a>
    </p>

    <button
      @click="openSearchUrl"
      :disabled="!searchQuery.trim()"
      class="search-button"
    >
      Search GitHub
    </button>

    <p v-if="!searchQuery.trim()" class="note">
      *Please enter a query to enable the search button.
    </p>
  </div>
</template>

<script setup>
/* ----------  logic untouched ---------- */
import { ref, computed } from 'vue';

const searchQuery = ref('');

const basePrefix = 'awesome';
const baseSuffix = 'site:github.com';
const searchEngine = 'https://www.google.com/search?q=';

const generatedUrl = computed(() => {
  const query = searchQuery.value.trim();
  const encodedQuery = encodeURIComponent(
    `${basePrefix} ${query} ${baseSuffix}`
  );
  return `${searchEngine}${encodedQuery}`;
});

function openSearchUrl() {
  if (searchQuery.value.trim()) {
    window.open(generatedUrl.value, '_blank');
  }
}
</script>

<style scoped>
/* ----------  dark-theme styles ---------- */
.search-container {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  border: 2px solid #0d7377;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

h2 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #0d7377;
  color: #14ffec;
  font-weight: 600;
}

.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2d2d2d;
  color: #f1f1f1;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input:focus {
  outline: none;
  border-color: #14ffec;
}
.search-input::placeholder {
  color: #888;
}

.url-display {
  background-color: #252525;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  word-break: break-all;
  margin-bottom: 20px;
  line-height: 1.4;
}

.url-link {
  color: #14ffec;
  text-decoration: none;
}
.url-link:hover {
  text-decoration: underline;
}

.search-button {
  padding: 10px 20px;
  background-color: #0d7377;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s;
}
.search-button:hover:not(:disabled) {
  background-color: #14ffec;
  color: #1e1e1e;
}
.search-button:disabled {
  background-color: #444;
  color: #777;
  cursor: not-allowed;
}

.note {
  color: #ff7b7b;
  font-size: 14px;
  margin-top: 10px;
}
</style>
