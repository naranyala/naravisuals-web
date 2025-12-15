
<template>
  <div class="book-root">
    <!-- Header -->
    <header class="book-header">
      <button
        class="menu-btn"
        aria-label="Toggle table of contents"
        @click="tocOpen = !tocOpen"
      >
        ☰
      </button>
      <span class="book-title">{{ book.title }}</span>
    </header>

    <!-- Body -->
    <div class="book-body">
      <!-- TOC -->
      <aside
        class="book-toc"
        :class="{ open: tocOpen }"
      >
        <nav>
          <ul>
            <li
              v-for="(ch, i) in chapters"
              :key="ch.id"
              :class="{ active: i === index }"
              @click="go(i)"
            >
              {{ ch.title }}
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Backdrop (mobile) -->
      <div
        v-if="tocOpen"
        class="backdrop"
        @click="tocOpen = false"
      />

      <!-- Content -->
      <main class="book-content">
        <article>
          <h1>{{ current.title }}</h1>

          <p
            v-for="(p, i) in current.content"
            :key="i"
          >
            {{ p }}
          </p>
        </article>

        <!-- Pager -->
        <footer class="pager">
          <button
            :disabled="index === 0"
            @click="go(index - 1)"
          >
            ← Previous
          </button>

          <button
            :disabled="index === chapters.length - 1"
            @click="go(index + 1)"
          >
            Next →
          </button>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

/* ---------- book data ---------- */

const book = {
  title: "My Rusty Book",
}

const chapters = [
  {
    id: "intro",
    title: "1. Introduction",
    content: [
      "Welcome to the book.",
      "This chapter introduces the core ideas.",
    ],
  },
  {
    id: "guessing-game",
    title: "2. Programming a Guessing Game",
    content: [
      "We will build a small game step by step.",
      "Along the way you’ll learn fundamental concepts.",
    ],
  },
  {
    id: "common-concepts",
    title: "3. Common Programming Concepts",
    content: [
      "Variables, functions, ownership, and control flow.",
    ],
  },
]

/* ---------- state ---------- */

const index = ref(0)
const tocOpen = ref(false)

const current = computed(() => chapters[index.value])

function go(i) {
  index.value = i
  tocOpen.value = false
}
</script>

<style>
/* ================= BASE ================= */
.book-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: system-ui, -apple-system, serif;
}

/* ================= HEADER ================= */
.book-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2f2f2f;
  background: #1e1e1e;
}

.book-title {
  font-weight: 600;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1.25rem;
  cursor: pointer;
}

/* ================= BODY ================= */
.book-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* ================= TOC ================= */
.book-toc {
  width: 280px;
  padding: 1rem 1.25rem;
  border-right: 1px solid #2f2f2f;
  background: #1e1e1e;
  overflow-y: auto;
}

.book-toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.book-toc li {
  padding: 0.35rem 0;
  cursor: pointer;
  color: #b5b5b5;
  line-height: 1.4;
}

.book-toc li.active {
  color: #ffffff;
  font-weight: 600;
}

.book-toc li:hover {
  color: #4fc1ff;
}

/* ================= CONTENT ================= */
.book-content {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 1.25rem 3rem;
}

.book-content article {
  max-width: 720px;
  margin: 0 auto;
}

.book-content h1 {
  margin-bottom: 1.5rem;
}

.book-content p {
  line-height: 1.65;
  margin-bottom: 1.25rem;
  color: #d0d0d0;
}

/* ================= PAGER ================= */
.pager {
  display: flex;
  justify-content: space-between;
  max-width: 720px;
  margin: 3rem auto 0;
}

.pager button {
  background: none;
  border: 1px solid #333;
  color: #e0e0e0;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
}

.pager button:disabled {
  opacity: 0.35;
  cursor: default;
}

/* ================= MOBILE ================= */
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline;
  }

  .book-toc {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 10;
  }

  .book-toc.open {
    transform: translateX(0);
  }

  .book-content {
    padding: 1.75rem 1rem 2.5rem;
  }
}
</style>
