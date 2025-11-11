<script setup>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  sources: {
    type: Array,
    required: true,
    default: () => []
  }
})

const pages = ref([])
const loading = ref(true)
const activeIndex = ref(0)

const loadMarkdown = async () => {
  loading.value = true
  pages.value = props.sources.map(s => ({ 
    title: s.title, 
    url: s.url, 
    html: '', 
    error: false 
  }))

  await Promise.all(props.sources.map(async (source, i) => {
    try {
      const res = await fetch(source.url)
      const text = await res.text()
      pages.value[i].html = marked.parse(text)
    } catch (err) {
      pages.value[i].error = true
      pages.value[i].html = `<p class="error">Failed to load: ${err.message}</p>`
    }
  }))

  loading.value = false
}

onMounted(() => {
  loadMarkdown()
})
</script>

<template>
  <div class="reader">
    <nav class="nav">
      <button
        v-for="(page, i) in pages"
        :key="i"
        @click="activeIndex = i"
        :class="{ active: activeIndex === i }"
        class="nav-btn"
      >
        {{ page.title }}
      </button>
    </nav>

    <main class="content">
      <div v-if="loading" class="loading">
        Loading markdown files...
      </div>

      <div v-else class="page">
        <h1 class="page-title">{{ pages[activeIndex]?.title }}</h1>
        <div 
          v-html="pages[activeIndex]?.html" 
          class="markdown"
        ></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.reader {
  display: flex;
  min-height: 100vh;
  background: #0f0f0f;
  color: #e0e0e0;
}

.nav {
  width: 250px;
  background: #1a1a1a;
  border-right: 1px solid #333;
  padding: 20px;
  overflow-y: auto;
}

.nav-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: transparent;
  color: #999;
  border: none;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-btn:hover {
  background: #252525;
  color: #e0e0e0;
}

.nav-btn.active {
  background: #2a2a2a;
  color: #4a9eff;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.loading {
  text-align: center;
  color: #999;
  padding: 50px;
}

.page-title {
  font-size: 32px;
  margin-bottom: 30px;
  color: #fff;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}

.markdown {
  max-width: 800px;
  line-height: 1.7;
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3) {
  margin-top: 32px;
  margin-bottom: 16px;
  color: #fff;
}

.markdown :deep(h1) { font-size: 28px; }
.markdown :deep(h2) { font-size: 22px; }
.markdown :deep(h3) { font-size: 18px; }

.markdown :deep(p) {
  margin-bottom: 16px;
}

.markdown :deep(code) {
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  color: #e0e0e0;
}

.markdown :deep(pre) {
  background: #1a1a1a;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown :deep(pre code) {
  padding: 0;
  background: none;
}

.markdown :deep(a) {
  color: #4a9eff;
  text-decoration: none;
}

.markdown :deep(a:hover) {
  text-decoration: underline;
}

.markdown :deep(ul),
.markdown :deep(ol) {
  margin-left: 20px;
  margin-bottom: 16px;
}

.markdown :deep(blockquote) {
  border-left: 3px solid #333;
  padding-left: 16px;
  color: #999;
  margin-bottom: 16px;
}

.markdown :deep(.error) {
  color: #ff6b6b;
  background: #2a1a1a;
  padding: 16px;
  border-radius: 6px;
  border-left: 3px solid #ff6b6b;
}

@media (max-width: 768px) {
  .reader {
    flex-direction: column;
  }
  
  .nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #333;
  }
  
  .content {
    padding: 20px;
  }
}
</style>
