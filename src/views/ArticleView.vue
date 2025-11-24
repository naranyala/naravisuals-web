<script setup>
import { ref, computed } from 'vue';

// --- Article Data (Unchanged from previous response) ---
const articles = ref([
  {
    id: 1,
    title: 'The Future of Frontend Development',
    summary: 'A look into modern framework trends, performance optimizations, and the rise of server-side components.',
    content: [
      { chapterTitle: 'Chapter 1: The Rise of Build Tools', body: 'The landscape of frontend development is constantly evolving. The shift towards **Vite** and **Turbopack** is accelerating development cycles significantly, making initial load times near instantaneous.' },
      { chapterTitle: 'Chapter 2: Universal Rendering Trends', body: 'The move towards **universal** (or isomorphic) rendering, including Server-Side Rendering (SSR) and Static Site Generation (SSG), is key to modern performance.' },
      { chapterTitle: 'Chapter 3: The WebAssembly Factor', body: 'Furthermore, **WebAssembly (Wasm)** is opening new doors for performance-intensive tasks within the browser, allowing high-performance code written in languages like Rust or C++ to run at near-native speed.' },
    ],
  },
  {
    id: 2,
    title: 'Mastering Vue 3 Composables',
    summary: 'Understand how to create reusable, reactive logic using the Composition API to keep your components clean.',
    content: [
      { chapterTitle: 'Chapter 1: What are Composables?', body: 'Composables are functions that leverage Vue 3\'s reactivity system to encapsulate stateful logic. This pattern allows for powerful **code reuse** and improved separation of concerns.' },
      { chapterTitle: 'Chapter 2: Structure and Implementation', body: 'A composable typically starts with `use` (e.g., `useMousePosition`). Inside the function, you define reactive state using `ref` or `reactive` and expose only the necessary properties.' },
      { chapterTitle: 'Chapter 3: Real-World Examples', body: 'Common examples of composables in a large application include custom logic for API fetching (`useFetch`) or managing local browser storage (`useStorage`).' },
    ],
  },
]);

// --- State and Methods (Unchanged) ---
const selectedArticleId = ref(null);

const selectedArticle = computed(() => {
  if (selectedArticleId.value === null) {
    return null;
  }
  return articles.value.find(a => a.id === selectedArticleId.value);
});

const openReadingMode = (id) => {
  selectedArticleId.value = id;
};

const closeReadingMode = () => {
  selectedArticleId.value = null;
};
</script>

<template>
  <div class="article-container dark-theme">
    <h1 class="main-title">VueJS Chaptered Article Viewer</h1>

    <div v-if="selectedArticle" class="reading-mode">
      <button @click="closeReadingMode" class="back-button">
        &lt; Back to List
      </button>
      <h2>{{ selectedArticle.title }}</h2>
      <hr class="divider">

      <div v-for="(chapter, index) in selectedArticle.content" :key="index" class="article-chapter">
        <h3 class="chapter-title">{{ chapter.chapterTitle }}</h3>
        <p class="chapter-body">{{ chapter.body }}</p>
      </div>
    </div>

    <div v-else class="article-list">
      <h3>Select an Article to Read ({{ articles.length }} total)</h3>
      <ul>
        <li
          v-for="article in articles"
          :key="article.id"
          @click="openReadingMode(article.id)"
          class="article-item"
        >
          <h4>{{ article.title }}</h4>
          <p>{{ article.summary }}</p>
          <span class="read-more">Click to Read &gt;</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/*
|--------------------------------------------------------------------------
| 1. CSS Variables (The Key to Theming)
|--------------------------------------------------------------------------
*/
/* Default (Light) Theme Variables */
:root {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f0f0f0;
    --color-text-primary: #1a1a1a;
    --color-text-secondary: #666666;
    --color-accent: #42b883; /* Vue Green */
    --color-border: #35495e;
    --color-list-item-bg: #fff;
    --color-list-item-hover-bg: #f5f5f5;
}

/* Dark Theme Variables (Override for .dark-theme) */
.dark-theme {
    /* Main Backgrounds and Text */
    --color-bg-primary: #121212;
    --color-bg-secondary: #1e1e1e;
    --color-text-primary: #e0e0e0;
    --color-text-secondary: #aaaaaa;
    
    /* Accent and Borders */
    --color-accent: #69f0ae; /* A brighter, friendly green for dark mode */
    --color-border: #333333;
    
    /* List/Card Specifics */
    --color-list-item-bg: #222222;
    --color-list-item-hover-bg: #2a2a2a;
}


/*
|--------------------------------------------------------------------------
| 2. General Layout & Base Styles (Using Variables)
|--------------------------------------------------------------------------
*/
.article-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  
  /* Apply dark theme background/text colors to the root */
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  min-height: 100vh;
  transition: background-color 0.3s;
}

.main-title {
  border-bottom: 2px solid var(--color-accent);
  padding-bottom: 10px;
  margin-bottom: 20px;
  color: var(--color-accent);
}

.divider {
    border: 0;
    height: 1px;
    background: var(--color-border);
    margin: 20px 0;
}

/* --- List Styling --- */
.article-list ul {
  list-style: none;
  padding: 0;
}

.article-item {
  background-color: var(--color-list-item-bg);
  border: 1px solid var(--color-border);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.article-item:hover {
  background-color: var(--color-list-item-hover-bg);
  border-color: var(--color-accent);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.article-item h4 {
  margin: 0 0 5px 0;
  color: var(--color-text-primary);
}

.article-item p {
  font-size: 0.9em;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

.read-more {
  display: block;
  font-size: 0.8em;
  color: var(--color-accent);
  font-weight: bold;
}

/* --- Reading Mode Styling --- */
.reading-mode {
  padding: 25px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
}

.back-button {
  background: none;
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: var(--color-accent);
  color: var(--color-bg-secondary);
}

.reading-mode h2 {
  color: var(--color-accent);
  margin-top: 0;
  font-size: 2em;
}

/* --- Chapter Structure Styling --- */
.article-chapter {
  margin-bottom: 30px;
  padding: 15px;
  border-left: 5px solid var(--color-accent);
  background-color: var(--color-list-item-hover-bg); /* slightly darker than reading mode bg */
  border-radius: 4px;
}

.chapter-title {
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--color-border);
  font-size: 1.3em;
}

.chapter-body {
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin: 0;
}
</style>
