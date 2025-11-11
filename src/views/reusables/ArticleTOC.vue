<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { marked } from 'marked'

// Props
const props = defineProps({
  markdown: {
    type: String,
    required: true
  }
})

// Reactive state
const toc = ref([]) // [{ text, level, id }, ...]
const activeId = ref('')

// Generate TOC from markdown
const generateToc = (md) => {
  const tokens = marked.lexer(md)
  const headings = tokens.filter(token => token.type === 'heading')

  const tocItems = headings.map(heading => ({
    text: heading.text,
    level: heading.depth, // 1 for #, 2 for ##, etc.
    id: heading.text
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }))

  toc.value = tocItems
}

// Smooth scroll to heading
const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Track active heading on scroll
const handleScroll = () => {
  const headings = toc.value.map(item => ({
    id: item.id,
    offset: document.getElementById(item.id)?.offsetTop || 0
  })).filter(h => h.offset > 0)

  if (headings.length === 0) return

  const scrollPosition = window.scrollY + 100 // offset for fixed headers

  // Find the heading just above current scroll
  let current = headings[0].id
  for (let i = headings.length - 1; i >= 0; i--) {
    if (scrollPosition >= headings[i].offset) {
      current = headings[i].id
      break
    }
  }

  activeId.value = current
}

// Lifecycle
onMounted(() => {
  generateToc(props.markdown)
  nextTick(() => {
    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial check
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Watch for markdown changes (if dynamic)
watch(() => props.markdown, (newMd) => {
  generateToc(newMd)
  nextTick(handleScroll)
})
</script>

<template>
  <div class="markdown-toc" v-if="toc.length > 0">
    <h3 class="toc-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      Table of Contents
    </h3>
    <ul class="toc-list">
      <li v-for="item in toc" :key="item.id" :class="`toc-level-${item.level}`">
        <a
          :href="`#${item.id}`"
          @click.prevent="scrollTo(item.id)"
          :class="{ active: activeId === item.id }"
          class="toc-link"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.markdown-toc {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  font-family: 'Inter', system-ui, sans-serif;
  /* position: sticky; */
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #60a5fa;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toc-title svg {
  opacity: 0.8;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin: 0.35rem 0;
}

.toc-level-1 { padding-left: 0; }
.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }
.toc-level-4 { padding-left: 3rem; }
.toc-level-5 { padding-left: 4rem; }
.toc-level-6 { padding-left: 5rem; }

.toc-link {
  display: block;
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.35rem 0;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.toc-link:hover {
  color: #fff;
  background: rgba(96, 165, 250, 0.15);
  padding-left: 0.5rem;
}

.toc-link.active {
  color: #60a5fa;
  font-weight: 600;
  background: rgba(96, 165, 250, 0.25);
}

.toc-link.active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #60a5fa;
  border-radius: 50%;
}

/* Scrollbar */
.markdown-toc::-webkit-scrollbar {
  width: 6px;
}

.markdown-toc::-webkit-scrollbar-track {
  background: transparent;
}

.markdown-toc::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.markdown-toc::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Mobile */
@media (max-width: 768px) {
  .markdown-toc {
    position: static;
    margin: 1.5rem 0;
    padding: 1rem;
  }
}
</style>
