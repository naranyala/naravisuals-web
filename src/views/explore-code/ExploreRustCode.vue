<template>
  <div class="container">
    <h1 v-if="isTitleVisible">Rust Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic">
      <pre class="line-numbers language-rust" v-html="highlightedCode"></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-rust'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
// 👇 You MUST import the JS for line-numbers plugin
import 'prismjs/plugins/line-numbers/prism-line-numbers'

const props = defineProps(["topics", "isTitleVisible"])
const topics = props?.topics
const currentTopic = ref(topics[0])

// Computed: highlight code using Prism
const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.rust, 'rust')
})

// Optional: re-highlight on topic change (not strictly needed with computed)
watch(currentTopic, async () => {
  await nextTick()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 30px 0;
  font-family: system-ui, sans-serif;

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
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

pre {
  background: #282c34;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 1rem;
  /* Ensure line numbers plugin renders properly */
  white-space: pre;
  tab-size: 4;
}
</style>
