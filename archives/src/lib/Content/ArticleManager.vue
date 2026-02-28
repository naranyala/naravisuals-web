<script setup>
import { marked } from 'marked';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  search: String,
});

const emit = defineEmits(['closeArticle']);

const selectedArticle = ref(null);
const articleSearch = ref(props.search || '');
const contentRef = ref(null);
const mermaidContainer = ref(null);
const mermaidBlocks = [];
let mermaidInitialized = false;
let mathJaxInitialized = false;

const articles = [
  {
    id: '1',
    title: 'Memory Layout in C',
    date: 'Jan 10, 2025',
    description: 'Understanding virtual memory and memory layout in C programs',
    content: `# Memory Layout in C Programs

When a C program is compiled and loaded into memory, it occupies a specific layout known as the **process address space**.

## The Memory Regions

\`\`\`mermaid
flowchart TB
    subgraph Kernel Space ["Kernel Space (OS)"]
    end

    subgraph User Space ["User Space"]
        Stack["Stack<br/>⬇️ grows down"]
        Heap["Heap<br/>⬆️ grows up"]
        BSS["BSS<br/>Uninitialized data"]
        Data["Data<br/>Initialized data"]
        Text["Text/Code<br/>Program code"]
    end

    Kernel Space --> 0x0
    Text --> 0x400000
    Data --> Text
    BSS --> Data
    Heap --> BSS
    Stack --> Heap
    Stack --> 0x7FFFFFFFFFFF
\`\`\`

## Stack vs Heap

The stack and heap grow towards each other:

| Region | Growth Direction | Allocation Speed | Lifetime |
|--------|-----------------|------------------|----------|
| Stack | ↓ Down | O(1) | Function scope |
| Heap | ↑ Up | O(n) | Manual control |

## Math in Memory Layout

The virtual address space size on 64-bit systems:

$$2^{64} = 18446744073709551616 \\text{ bytes}$$

But actually usable per process:

$$2^{48} = 281474976710656 \\text{ bytes} = 256 \\text{ TB}$$`,
  },
  {
    id: '2',
    title: 'Async JavaScript Patterns',
    date: 'Jan 15, 2025',
    description: 'Understanding async/await, promises, and event loop',
    content: `# Async JavaScript Patterns

JavaScript's asynchronous nature is fundamental to modern web development.

## The Event Loop

\`\`\`mermaid
flowchart LR
    CallStack["Call Stack"] --> WebAPIs["Web APIs"]
    WebAPIs --> CallbackQueue["Callback Queue"]
    CallbackQueue --> EventLoop["Event Loop"]
    EventLoop --> CallStack

    style CallStack fill:#e1f5fe
    style WebAPIs fill:#fff3e0
    style CallbackQueue fill:#f3e5f5
    style EventLoop fill:#e8f5e8
\`\`\`

## Promise States

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Fulfilled: resolve()
    Pending --> Rejected: reject()
    Fulfilled --> [*]
    Rejected --> [*]
\`\`\`

## Basic Patterns

### Promise Chain

\`\`\`javascript
fetchData()
  .then(process)
  .then(save)
  .catch(handleError);
\`\`\`

### Async/Await

\`\`\`javascript
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(userId);
    return { user, posts };
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}
\`\`\``,
  },
  {
    id: '3',
    title: 'Rust Ownership Deep Dive',
    date: 'Jan 20, 2025',
    description: 'Understanding Rust ownership system and memory safety',
    content: `# Rust Ownership System

Rust's ownership model ensures memory safety without garbage collection.

## The Three Rules

\`\`\`mermaid
flowchart TB
    subgraph Ownership ["Ownership Rules"]
        A["1. Each value has an owner"]
        B["2. One owner at a time"]
        C["3. Owner goes out of scope → value dropped"]
    end
\`\`\`

## Ownership in Action

\`\`\`rust
fn main() {
    // s1 owns the String
    let s1 = String::from("hello");

    // s2 takes ownership
    let s2 = s1;

    // println!("{}", s1); // ERROR: s1 is no longer valid
    println!("{}", s2);   // OK: s2 owns the data
}
\`\`\`

## The Borrow Checker

The \`'a\` lifetime annotation means: "The returned reference will live as long as the shorter of the two input references."

## Math: Move Semantics Performance

For $n$ elements, moving is $O(1)$ while cloning is $O(n)$:

$$\\text{Copy time} = n \\times \\text{element\\_size}$$

$$\\text{Move time} = 1 \\times \\text{pointer\\_size}$$`,
  },
];

const filteredArticles = computed(() =>
  articles.filter((a) =>
    a.title?.toLowerCase().includes(articleSearch.value.toLowerCase()),
  ),
);

const currentArticle = computed(() =>
  articles.find((a) => a.id === selectedArticle.value),
);

const selectArticle = (article) => {
  selectedArticle.value = article.id;
};

const closeArticle = () => {
  selectedArticle.value = null;
};

// Markdown rendering functions
const extractMermaidBlocks = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  mermaidBlocks.length = 0;

  tempDiv
    .querySelectorAll('code.language-mermaid, pre.language-mermaid')
    .forEach((block, index) => {
      const code = block.textContent || block.innerText;
      const id = `mermaid-${Date.now()}-${index}`;
      mermaidBlocks.push({ id, code });
      block.outerHTML = `<div class="mermaid-block" data-mermaid-id="${id}"></div>`;
    });

  return tempDiv.innerHTML;
};

const renderMathJax = async () => {
  if (!window.MathJax || !contentRef.value || !mathJaxInitialized) return;

  try {
    await window.MathJax.typesetPromise([contentRef.value]);
  } catch (err) {
    console.error('MathJax error:', err);
  }
};

const renderMermaid = async () => {
  if (!window.mermaid || !mermaidInitialized) return;

  for (const block of mermaidBlocks) {
    const el = document.querySelector(`[data-mermaid-id="${block.id}"]`);
    if (!el) continue;

    try {
      const { svg } = await window.mermaid.render(block.id, block.code);
      el.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid error:', err);
      el.innerHTML = '<p style="color: red;">Diagram error</p>';
    }
  }
};

const initMathJax = () => {
  if (mathJaxInitialized || typeof window.MathJax !== 'undefined') {
    mathJaxInitialized = true;
    return;
  }

  window.MathJax = {
    tex: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      displayMath: [
        ['$$', '$$'],
        ['\\[', '\\]'],
      ],
    },
    svg: {
      fontCache: 'global',
    },
    startup: {
      ready: () => {
        window.MathJax.startup.defaultReady();
        mathJaxInitialized = true;
        renderMathJax();
      },
    },
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
  script.async = true;
  document.head.appendChild(script);
};

const initMermaid = () => {
  if (mermaidInitialized || typeof window.mermaid !== 'undefined') {
    mermaidInitialized = true;
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  script.onload = () => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    mermaidInitialized = true;
    renderMermaid();
  };
  document.head.appendChild(script);
};

const renderArticleContent = async () => {
  if (!contentRef.value || !currentArticle.value) return;

  console.log('Rendering article content:', currentArticle.value.title);

  if (
    !currentArticle.value.content ||
    currentArticle.value.content.trim() === ''
  ) {
    contentRef.value.innerHTML = '<p>No content to display</p>';
    return;
  }

  const rawHtml = marked.parse(currentArticle.value.content);
  const processedHtml = extractMermaidBlocks(rawHtml);
  contentRef.value.innerHTML = processedHtml;

  await nextTick();
  await renderMathJax();
  await renderMermaid();
};

// Watch for article changes to re-render content
watch(currentArticle, async (newArticle) => {
  if (newArticle) {
    await renderArticleContent();
  }
});

// Initialize libraries on mount
onMounted(() => {
  initMathJax();
  initMermaid();
});
</script>

<template>
  <div class="article-reader">
    <div v-if="!selectedArticle">
      <h1 class="title">Articles</h1>

      <input
        type="text"
        placeholder="Search articles..."
        v-model="articleSearch"
        class="search"
      />

      <div class="list">
        <div
          v-for="a in filteredArticles"
          :key="a.id"
          class="card"
          @click="selectArticle(a)"
        >
          <h3 class="card-title">{{ a.title }}</h3>
          <p class="card-desc">{{ a.description }}</p>
          <div class="date">{{ a.date }}</div>
        </div>
      </div>

      <div v-if="filteredArticles.length === 0" class="no-results">
        No articles found
      </div>
    </div>

    <div v-else class="article-view">
      <div class="article-header">
        <button class="back-btn" @click="closeArticle">← Back to Articles</button>
        <h1 class="article-title">{{ currentArticle.title }}</h1>
        <div class="article-meta">
          <span class="date">{{ currentArticle.date }}</span>
        </div>
      </div>

      <div class="article-body">
        <div ref="contentRef" class="markdown-content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-reader {
  min-height: calc(100vh - 100px);
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.article-reader .title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #f1f5f9;
}

.article-reader .search {
  width: 100%;
  padding: 14px 18px;
  margin-bottom: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.article-reader .search:focus {
  border-color: #475569;
  background: #252f3f;
}

.article-reader .search::placeholder {
  color: #64748b;
}

.article-reader .list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.article-reader .card {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.article-reader .card:hover {
  transform: translateY(-4px);
  border-color: #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.article-reader .card-title {
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  color: #f1f5f9;
}

.article-reader .card-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.article-reader .date {
  font-size: 0.85rem;
  color: #64748b;
}

.article-reader .no-results {
  text-align: center;
  color: #64748b;
  padding: 40px;
}

.article-reader .article-view {
  animation: fadeIn 0.3s ease;
}

.article-reader .article-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #334155;
}

.article-reader .back-btn {
  background: transparent;
  border: 1px solid #334155;
  padding: 8px 16px;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.article-reader .back-btn:hover {
  background: #1e293b;
  color: #e2e8f0;
}

.article-reader .article-title {
  font-size: 2rem;
  margin: 0 0 8px 0;
  color: #f1f5f9;
  font-weight: 600;
}

.article-reader .article-meta {
  color: #64748b;
  font-size: 0.9rem;
}

.article-reader .article-body {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* Markdown Content Styles */
.markdown-content :deep(h1) {
  font-size: 2rem;
  color: #f6fbff;
  margin: 32px 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  color: #e6f2ff;
  margin: 28px 0 12px;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  color: #e6f2ff;
  margin: 24px 0 10px;
}

.markdown-content :deep(p) {
  margin: 16px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 8px 0;
}

.markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  color: #a7d7ff;
}

.markdown-content :deep(pre) {
  background: #0d1117;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 0.85rem;
  line-height: 1.6;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #475569;
  margin: 20px 0;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.02);
  color: #94a3b8;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #334155;
  padding: 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  color: #e2e8f0;
}

.markdown-content :deep(.mermaid-block) {
  background: #f6f8fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.markdown-content :deep(.mermaid-block svg) {
  max-width: 100%;
  height: auto;
}

@media (max-width: 640px) {
  .article-reader {
    padding: 12px;
  }

  .article-reader .list {
    grid-template-columns: 1fr;
  }

  .article-reader .card {
    padding: 16px;
  }
}
</style>