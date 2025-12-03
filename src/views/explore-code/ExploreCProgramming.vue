<template>
  <div class="container">
    <h1 v-if="props?.isTitleVisible || false">C Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-c" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-c'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'


const props = defineProps(["topics", "isTitleVisible"])
const topics = props?.topics || [];

const currentTopic = ref(topics[0])

// Highlight code reactively using Prism
const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  // Ensure C grammar is loaded
  return Prism.highlight(code, Prism.languages.c, 'c')
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  font-family: system-ui, sans-serif;
  padding: 1.5rem;

  h1 {
    margin-bottom: 50px;
  }
}

nav {
  margin-bottom: 1rem;
  display: flex;
  gap: 5px;
}

button {
  margin-right: 0.6rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 1rem;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

button:hover {
  background: #2d3748;
}

h1,
h2 {
  color: #2d3748;
}

p {
  color: #4a5568;
  line-height: 1.6;
}

pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1.2rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 1rem;
  font-size: 0.95em;
  line-height: 1.4;
  white-space: pre;
  tab-size: 4;
}

/* Optional: improve line number styling */
pre.line-numbers {
  position: relative;
  padding-left: 3.8em;
  counter-reset: linenumber;
}

pre.line-numbers>code {
  position: relative;
  white-space: inherit;
}
</style>
