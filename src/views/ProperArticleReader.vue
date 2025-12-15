
<template>
  <div class="reader">
    <h1>{{ currentArticle.title }}</h1>

    <div
      class="content"
      v-html="renderedMarkdown"
    ></div>

    <div class="nav">
      <button @click="prevArticle" :disabled="index === 0">Prev</button>
      <button @click="nextArticle" :disabled="index === articles.length - 1">Next</button>
    </div>

    <p class="indicator">
      {{ index + 1 }} / {{ articles.length }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import MarkdownIt from "markdown-it"

const md = new MarkdownIt()



export function dedent(str) {
  // Remove first and last newline to keep template clean
  let text = str.replace(/^\n/, "").replace(/\n\s*$/, "");

  // Detect minimum indent across all non-empty lines
  const lines = text.split("\n");
  const indents = lines
    .filter(line => line.trim()) // ignore empty lines
    .map(line => line.match(/^(\s*)/)[0].length);

  const minIndent = Math.min(...indents);

  // Strip that indent from all lines
  const out = lines
    .map(line => line.slice(minIndent))
    .join("\n");

  return out;
}


export const articles = [
  {
    title: "Vue Basics",
    markdown: dedent(`
      # Vue Basics

      Vue is a progressive framework for building interactive UIs.  
      It focuses on declarative rendering and component composition.

      ## Key concepts
      - Reactive data binding  
      - Component-based architecture  
      - Template-driven UI  
    `)
  },

  {
    title: "Script Setup",
    markdown: dedent(`
      # Script Setup

      The \`<script setup>\` syntax is a compile-time enhancement for Vue 3's Composition API.
      It reduces boilerplate and provides direct access to bindings in the template.

      ## Benefits
      - Minimal component code  
      - Better TypeScript support  
      - Auto-unwrapped refs in templates  
    `)
  },

  {
    title: "Reactivity",
    markdown: dedent(`
      # Reactivity Model

      Vue's reactivity system tracks fine-grained dependencies so updates are efficient
      without manual optimization.

      ## Core reactive primitives
      - \`ref()\` — for primitives  
      - \`reactive()\` — for objects  
      - \`computed()\` — for derived state  
      - \`watch()\` — for side effects  

      ## Why it matters
      Vue updates only what's needed, improving performance even in complex UIs.
    `)
  }
];


const index = ref(0)

const currentArticle = computed(() => articles[index.value])

const renderedMarkdown = computed(() =>
  md.render(currentArticle.value.markdown)
)

const nextArticle = () => {
  if (index.value < articles.length - 1) index.value++
}

const prevArticle = () => {
  if (index.value > 0) index.value--
}
</script>

<style scoped>
/* Dark mode defaults using variables */
:root {
  --bg: #0f0f0f;
  --fg: #e5e5e5;
  --fg-muted: #bbbbbb;
  --accent: #4da3ff;
}

.reader {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.7;
  font-size: 1rem;
}

/* Mobile-friendly typography */
@media (max-width: 600px) {
  .reader {
    padding: 16px;
    font-size: 0.95rem;
  }

  h1 {
    font-size: 1.6rem;
  }
}

h1 {
  margin-bottom: 1rem;
  color: var(--fg);
}

/* Markdown content styling */
.content h1,
.content h2,
.content h3 {
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
}

.content p,
.content ul {
  margin-bottom: 1rem;
}

.content a {
  color: var(--accent);
}

/* Navigation */
.nav {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  background: #222;
  color: var(--fg);
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.4;
}

.indicator {
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--fg-muted);
  text-align: center;
}
</style>
