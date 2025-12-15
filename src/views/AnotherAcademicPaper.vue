
<template>
  <main class="paper">
    <header class="paper-header">
      <h1>{{ paper.title }}</h1>
      <p class="authors">{{ paper.authors }}</p>
    </header>

    <article class="paper-body">
      <!-- Abstract -->
      <section>
        <h2>Abstract</h2>
        <p>{{ paper.abstract }}</p>
      </section>

      <!-- Sections -->
      <section v-for="(sec, si) in paper.sections" :key="si">
        <h2>{{ sec.title }}</h2>

        <!-- optional subsections -->
        <template v-for="(sub, subi) in sec.subsections" :key="subi">
          <h3>{{ sub.title }}</h3>
          <p v-for="(para, pi) in sub.paragraphs" :key="pi">{{ para }}</p>
        </template>

        <!-- section paragraphs -->
        <p v-for="(p, pi) in sec.paragraphs" :key="pi">{{ p }}</p>
      </section>

      <!-- References -->
      <section>
        <h2>References</h2>
        <ol class="references">
          <li v-for="(ref, ri) in paper.references" :key="ri">
            {{ ref }}
          </li>
        </ol>
      </section>
    </article>
  </main>
</template>

<script setup>
import { reactive } from 'vue'

const paper = reactive({
  title: "Understanding WebAssembly Acceleration Techniques",
  authors: "Fudzer Huda · Department of Computer Science · 2025",
  abstract:
    "WebAssembly (Wasm) is rapidly transforming web performance. This paper surveys several acceleration strategies and integration pathways for browser-based applications.",

  sections: [
    {
      title: "1. Introduction",
      paragraphs: [
        "With the rise of high-performance client applications, developers are increasingly turning to Wasm modules for compute-heavy tasks.",
      ],
      subsections: []
    },

    {
      title: "2. Background",
      subsections: [
        {
          title: "2.1 WebAssembly Concepts",
          paragraphs: [
            "WebAssembly provides a portable, low-level binary instruction format optimized for predictable execution.",
            "Compilers like Clang or Rustc often target Wasm output as part of their toolchains."
          ]
        },
        {
          title: "2.2 Browsers as Virtual Machines",
          paragraphs: Array.from({ length: 6 }, (_, i) =>
            `Long content paragraph ${i + 1}, exploring browser pipelines, decoding, optimization passes, and stack execution models.`
          )
        }
      ],
      paragraphs: []
    },

    {
      title: "3. Performance Experiments",
      paragraphs: Array.from({ length: 12 }, (_, i) =>
        `Experimental paragraph ${i + 1} — Lorem ipsum text simulating academic narrative.`
      ),
      subsections: []
    },

    {
      title: "4. Conclusion",
      paragraphs: [
        "This demo shows a reactive academic paper structure with clean typographic rules. You may now dynamically update content, load markdown, or switch between paper datasets."
      ],
      subsections: []
    }
  ],

  references: [
    "WebAssembly Core Specification, W3C, 2024.",
    "A. Researcher, “Modern Wasm Pipelines,” 2023.",
    "Additional Wasm-related studies…"
  ]
})
</script>

<style>
.paper {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1.2rem 4rem;
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.7;
}

.paper-header h1 {
  font-size: 2rem;
  margin-bottom: 0.3rem;
}

.authors {
  font-size: 0.9rem;
  opacity: 0.8;
}

.paper-body h2 {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
}

.paper-body h3 {
  margin-top: 1.2rem;
  margin-bottom: 0.3rem;
  font-size: 1.15rem;
}

.references {
  padding-left: 1.2rem;
}

@media (prefers-color-scheme: dark) {
  .paper {
    background: #111;
    color: #eee;
  }
  .paper a {
    color: #8ab4ff;
  }
}

@media (max-width: 480px) {
  .paper {
    padding: 1.2rem;
    font-size: 0.95rem;
  }
  .paper-header h1 {
    font-size: 1.6rem;
  }
}
</style>
