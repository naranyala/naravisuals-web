<template>
  <div class="article-container">
    <header class="article-header">
      <h1>{{ article.title }}</h1>
      <div class="article-meta">
        <span>By {{ article.author }}</span>
        <span>{{ formatDate(article.date) }}</span>
      </div>
    </header>

    <div class="content-wrapper">
      <aside v-if="tocHeadings.length" class="toc">
        <h3>Contents</h3>
        <ul>
          <li v-for="h in tocHeadings" :key="h.id" :class="`l${h.level}`">
            <a :href="`#${h.id}`" :class="{ active: active === h.id }" @click.prevent="scrollTo(h.id)">{{ h.text }}</a>
          </li>
        </ul>
      </aside>

      <main class="content">
        <div v-for="(s, i) in article.content" :key="i">
          <h2 v-if="s.type === 'h2'" :id="`h${i}`">{{ s.text }}</h2>
          <h3 v-else-if="s.type === 'h3'" :id="`h${i}`">{{ s.text }}</h3>
          <p v-else-if="s.type === 'p'">{{ s.text }}</p>
          <blockquote v-else-if="s.type === 'quote'">{{ s.text }}</blockquote>
        </div>

        <div class="refs">
          <h2>References</h2>
          <ol>
            <li v-for="(r, i) in article.refs" :key="i">{{ r }}</li>
          </ol>
        </div>
      </main>
    </div>

    <button v-if="showTop" @click="top" class="top-btn">↑</button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

const article = reactive({
  title: "The Enduring Elegance of Serif Typography",
  author: "A. Designer",
  date: "2025-12-05",
  content: [
    { type: "p", text: "Serif fonts have graced written communication for over 500 years, offering superior readability for extended text." },
    { type: "h2", text: "Historical Foundations" },
    { type: "p", text: "Originating from Roman inscriptions, serifs were practical chisel marks that evolved into stylistic elements." },
    { type: "quote", text: "The serif is not an ornament, but a functional element that guides the eye." },
    { type: "h2", text: "Digital Resurgence" },
    { type: "p", text: "Modern screens now render serifs beautifully, reviving their use in digital publishing." },
    { type: "h3", text: "Web Typography" },
    { type: "p", text: "Services like Google Fonts have made classic serifs accessible for web projects." }
  ],
  refs: [
    "Bringhurst, R. (2004). The Elements of Typographic Style",
    "Lupton, E. (2010). Thinking with Type",
    "Adobe Fonts Serif Collection (2025)"
  ]
})

const tocHeadings = ref([])
const active = ref('')
const showTop = ref(false)

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric'
})

const generateTOC = () => {
  tocHeadings.value = article.content
    .map((s, i) => s.type.match(/^h\d$/) ? {
      id: `h${i}`,
      text: s.text,
      level: parseInt(s.type[1])
    } : null)
    .filter(Boolean)
}

const scrollTo = id => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const top = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const handleScroll = () => {
  showTop.value = window.scrollY > 200

  // Update active heading
  const headings = document.querySelectorAll('[id^="h"]')
  let current = ''
  headings.forEach(h => {
    const rect = h.getBoundingClientRect()
    if (rect.top <= 80 && rect.bottom >= 80) current = h.id
  })
  active.value = current
}

onMounted(() => {
  generateTOC()
  window.addEventListener('scroll', handleScroll)
  setTimeout(handleScroll, 100)
})

onBeforeUnmount(() =>
  window.removeEventListener('scroll', handleScroll)
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');

:root {
  --bg: #121212;
  --surface: #1e1e1e;
  --text: #e0e0e0;
  --muted: #a0a0a0;
  --accent: #d4af37;
  --border: #2d2d2d;
}

.article-container {
  font-family: 'EB Garamond', 'Crimson Text', Georgia, serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.article-header {
  text-align: center;
  margin: 2rem 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--text), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  color: var(--muted);
  font-style: italic;
  font-size: 0.95rem;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
}

.toc {
  flex: 0 0 200px;
  position: sticky;
  top: 1rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 8px;
  height: fit-content;
}

.toc h3 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--accent);
  font-weight: 600;
}

.toc ul {
  list-style: none;
  padding: 0;
}

.toc li {
  margin: 0.4rem 0;
}

.toc .l2 {
  padding-left: 0;
}

.toc .l3 {
  padding-left: 0.8rem;
}

.toc a {
  color: var(--muted);
  text-decoration: none;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  display: block;
  transition: all 0.2s;
}

.toc a:hover,
.toc a.active {
  color: var(--accent);
  background: rgba(212, 175, 55, 0.1);
}

.content {
  flex: 1;
  background: var(--surface);
  padding: 1.8rem;
  border-radius: 8px;
}

h2 {
  font-size: 1.6rem;
  margin: 1.8rem 0 1rem;
  color: var(--accent);
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

h3 {
  font-size: 1.3rem;
  margin: 1.5rem 0 0.8rem;
  color: #c0c0c0;
}

p {
  margin: 1rem 0;
  font-size: 1.05rem;
}

blockquote {
  font-style: italic;
  margin: 1.5rem 0;
  padding: 0.8rem 1.2rem;
  border-left: 3px solid var(--accent);
  background: rgba(212, 175, 55, 0.08);
  color: #d0d0d0;
}

.refs {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.refs h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--accent);
}

.refs ol {
  padding-left: 1.4rem;
}

.refs li {
  margin: 0.6rem 0;
  color: var(--muted);
}

.top-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  border: none;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}

.top-btn.show {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .toc {
    position: static;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.4rem;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
