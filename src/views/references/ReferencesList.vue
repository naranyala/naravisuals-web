<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'

const props = defineProps(['pdfList'])
const rawList = ref(props?.pdfList || [])

// ---------- fuse.js ----------
const query = ref('')
const fuse = new Fuse(rawList.value, {
  keys: ['title'],
  threshold: 0.3,        // 0 = exact, 1 = match anything
  includeScore: false,
  shouldSort: true
})

const filteredList = computed(() =>
  query.value.trim()
    ? fuse.search(query.value).map(r => r.item)
    : rawList.value
)
</script>

<template>
  <main class="paper-grid">
    <h1 class="title">arXiv Papers</h1>

    <!-- search -->
    <div class="search-wrap">
      <input
        v-model="query"
        class="search-input"
        placeholder="Filter titles …"
        type="text"
      />
    </div>

    <!-- cards -->
    <div class="cards">
      <a
        v-for="p in filteredList"
        :key="p.id"
        class="card"
        :href="`https://arxiv.org/pdf/${p.id}.pdf`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="card-id">{{ p.id }}</span>
        <span class="card-title">{{ p.title }}</span>
      </a>
    </div>
  </main>
</template>

<style scoped>
/* ---------- dark-theme tokens ---------- */
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: rgba(88, 166, 255, 0.7);
  --border-hover: #58a6ff;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --accent: #58a6ff;
  --accent-glow: 0 0 12px rgba(88, 166, 255, 0.35);
}

/* ---------- layout ---------- */
.paper-grid {
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: var(--bg);
  font-family: system-ui, sans-serif;
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

/* ---------- search ---------- */
.search-wrap {
  max-width: 460px;
  margin: 0 auto 2.5rem;
}
.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid graa;
  background: var(--surface);
  color: var(--text-primary);
  caret-color: var(--accent);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search-input:focus {
  border-color: white;
  box-shadow: var(--accent-glow);
}

/* ---------- cards ---------- */
.cards {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  max-width: 1100px;
  margin: 0 auto;
}

.card {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid gray;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: white;
  box-shadow: var(--accent-glow);
}

.card-id {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.card-title {
  font-size: 1.05rem;
  line-height: 1.4;
  color: var(--text-primary);
  flex: 1 0 auto;
}
</style>
