<template>
  <div class="markdown-viewer">
    <h1>Articles</h1>

    <!-- Loading state -->
    <p v-if="loading">Loading markdown files...</p>

    <!-- File list -->
    <ul v-else-if="!selectedFile && markdownFiles.length">
      <li v-for="file in markdownFiles" :key="file.path">
        <a href="#" @click.prevent="selectFile(file)">{{ file.name }}</a>
      </li>
    </ul>

    <!-- Empty state -->
    <p v-else-if="!selectedFile && !markdownFiles.length && !loading">
      No markdown files found in <code>../contents/</code>
    </p>

    <!-- Selected file -->
    <div v-if="selectedFile" :key="selectedFile.path">
      <h2>{{ selectedFile.name }}</h2>
      <div v-html="selectedFile.content" class="markdown-body"></div>
      <button @click="deselectFile">← Back to list</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked'; // correct import for marked ≥ v4

const markdownFiles = ref([]);
const selectedFile = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // Vite glob import – raw content as string
    const modules = import.meta.glob('../assets/markdown/*.md', { as: 'raw', eager: false });

    const promises = Object.keys(modules).map(async (path) => {
      const markdown = await modules[path](); // ← string, NOT .default
      const name = path.split('/').pop();     // e.g. "about.md"

      return {
        name,
        path,
        // Convert markdown → HTML
        content: marked(markdown), // marked v4+ takes a string directly
      };
    });

    markdownFiles.value = await Promise.all(promises);
  } catch (err) {
    console.error('Failed to load markdown files:', err);
  } finally {
    loading.value = false;
  }
});

function selectFile(file) {
  selectedFile.value = file;
}

function deselectFile() {
  selectedFile.value = null;
}
</script>

<style scoped>
.markdown-viewer {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}
a:hover {
  text-decoration: underline;
}
.markdown-body {
  line-height: 1.7;
  padding: 1rem 0;
}
button {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
