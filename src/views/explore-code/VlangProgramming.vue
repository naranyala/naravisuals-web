<template>
  <div class="container">
    <h1 v-if="props?.isTitleVisible || false">V Programming Explorations</h1>

    <!-- Navigation -->
    <nav>
      <button v-for="topic in topics" :key="topic.id" @click="currentTopic = topic"
        :class="{ active: currentTopic.id === topic.id }">
        {{ topic.title }}
      </button>
    </nav>

    <!-- Content -->
    <section v-if="currentTopic" class="topic-content">
      <!-- <h2>{{ currentTopic.title }}</h2> -->
      <!-- <p class="description">{{ currentTopic.description }}</p> -->
      <pre class="line-numbers language-v"><code v-html="highlightedCode"></code></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// === Custom Prism Language Definition for V (vlang) ===
Prism.languages.v = {
  comment: /\/\/.*/,
  string: {
    pattern: /r?'.*'|"([^"\\]|\\.)*"|`[^`]*`/,
    greedy: true
  },
  keyword: /\b(?:as|assert|break|const|continue|defer|else|enum|fn|for|go|goto|if|import|in|interface|is|lock|match|module|mut|none|or|pub|return|rlock|select|shared|sizeof|static|struct|type|typeof|unsafe)\b/,
  boolean: /\b(?:true|false)\b/,
  number: /\b0x[\da-fA-F]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:[eE][+-]?\d+)?/,
  operator: /==|!=|<=|>=|<|>|\+|-|\*|\/|%|!|&&|\|\||=|\?|:/,
  punctuation: /[{}[\];(),.:]/
}

// Optional: Add some nice aliases
Prism.languages.vlang = Prism.languages.v


const props = defineProps(["topics", "isTitleVisible"])
const topics = props?.topics || [];

const currentTopic = ref(topics[0])

const highlightedCode = computed(() => {
  if (!currentTopic.value) return ''
  const code = currentTopic.value.example
  return Prism.highlight(code, Prism.languages.v, 'v')
})

// Highlight on mount and topic change
onMounted(() => {
  Prism.highlightAll()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 0 1.5rem;

  h1 {
    margin-bottom: 50px;
  }

}

h1 {
  text-align: center;
  color: #5f63b8;
  margin-bottom: 0.5rem;
  font-size: 2.8rem;
}

.tagline {
  text-align: center;
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  font-weight: 500;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: left;
  margin-bottom: 3rem;
}

button {
  padding: 0.7rem 1.3rem;
  background: #5f63b8;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: #4c51a1;
  transform: translateY(-1px);
}

button.active {
  background: #3b3f80;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.topic-content h2 {
  color: #5f63b8;
  margin-top: 0;
  font-size: 1.8rem;
}

.description {
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

pre {
  background: #282c34 !important;
  border-radius: 12px;
  padding: 1.5rem !important;
  margin: 2rem 0;
  overflow-x: auto;
  font-size: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

pre.line-numbers {
  padding-left: 4.5em !important;
}

/* V language specific colors (override Prism tomorrow theme slightly) */
.token.keyword {
  color: #c678dd !important;
}

.token.string {
  color: #98c379 !important;
}

.token.function {
  color: #61afef !important;
}

.token.number {
  color: #d19a66 !important;
}

.token.operator {
  color: #56b6c2 !important;
}
</style>
