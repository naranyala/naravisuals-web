<!-- AcademicPaper.vue -->
<template>
  <div class="academic-paper-container">
    <!-- Print Toolbar -->
    <div class="print-toolbar">
      <button @click="printPaper" class="print-btn">
        🖨️ Print Paper
      </button>
    </div>

    <div class="layout-toggle">
      <button @click="twoColumn = !twoColumn">
        {{ twoColumn ? '📄 Single Column' : '📰 Two Columns' }}
      </button>
    </div>

    <!-- Actual Paper Content (will be printed) -->
    <!-- <div ref="printContent" class="academic-paper"> -->
    <div ref="printContent" :class="['academic-paper', { 'two-column': twoColumn }]">
      <!-- Paper Header -->
      <header class="paper-header">
        <h1 class="paper-title">{{ title }}</h1>
        <div class="paper-authors">
          <div v-for="(author, index) in authors" :key="index" class="author-block">
            <div class="author-name">{{ author.name }}</div>
            <div class="author-affiliation">{{ author.affiliation }}</div>
          </div>
        </div>
        <div class="paper-meta">
          <span>{{ venue }}</span> •
          <span>{{ date }}</span>
        </div>
      </header>

      <!-- Abstract -->
      <section class="paper-section">
        <h2 class="section-title">Abstract</h2>
        <p class="abstract">{{ abstract }}</p>
      </section>

      <!-- Main Content -->
      <main class="paper-content">
        <section v-for="(section, index) in content" :key="index" class="paper-section">
          <h2 class="section-title">{{ section.title }}</h2>
          <div v-for="(paragraph, pIndex) in section.paragraphs" :key="pIndex" class="paper-paragraph"
            v-html="paragraph"></div>
        </section>
      </main>

      <!-- References -->
      <section class="paper-section">
        <h2 class="section-title">References</h2>
        <div class="references">
          <div v-for="(ref, index) in references" :key="index" class="reference-item">
            [{{ index + 1 }}] {{ ref }}
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="paper-footer">
        <div class="footer-content">
          {{ footerText }}
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const twoColumn = ref(false)

const props = defineProps({
  title: { type: String, default: "Attention Is All You Need" },
  authors: {
    type: Array,
    default: () => [
      { name: "Ashish Vaswani", affiliation: "Google Brain" },
      { name: "Noam Shazeer", affiliation: "Google Research" }
    ]
  },
  venue: { type: String, default: "NeurIPS 2017" },
  date: { type: String, default: "December 2017" },
  abstract: {
    type: String,
    default: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
  },
  content: {
    type: Array,
    default: () => [
      {
        title: "Introduction",
        paragraphs: [
          "Recurrent neural networks, long short-term memory [13] and gated recurrent [7] neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation [35, 2, 5].",
          "The sequential nature of RNNs and their variants prevents parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has made significant inroads into reducing sequential computation through factorization tricks [21] and conditional computation [36], while also improving model performance in many cases."
        ]
      },
      {
        title: "Background",
        paragraphs: [
          "The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU [16], ByteNet [18] and ConvS2S [9], all of which use convolutional neural networks as basic building blocks, computing hidden representations in parallel for all input and output positions.",
          "In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions [12]."
        ]
      }
    ]
  },
  references: {
    type: Array,
    default: () => [
      "Vaswani, A., et al. (2017). Attention is all you need. Advances in neural information processing systems, 30.",
      "Bahdanau, D., Cho, K., & Bengio, Y. (2014). Neural machine translation by jointly learning to align and translate. arXiv preprint arXiv:1409.0473.",
      "Gehring, J., et al. (2017). Convolutional sequence to sequence learning. In Proceedings of the 34th International Conference on Machine Learning."
    ]
  },
  footerText: {
    type: String,
    default: "This paper is formatted according to academic standards. Preprint available at arXiv:1706.03762"
  }
})

const printContent = ref(null)

const printPaper = () => {
  if (!printContent.value) return

  // Clone the content to print
  const printArea = printContent.value.cloneNode(true)
  // Ensure the clone has the correct column class
  printArea.classList.remove('two-column') // Remove screen class first
  if (twoColumn.value) {
    printArea.classList.add('print-two-column') // Add the print-specific class
  }

  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Please allow popups for printing')
    return
  }

  // Inject the core academic print styles
  let printStyles = `
    /* Import academic fonts for print */
    @import url('https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&family=Source+Serif+Pro:wght@300;400;600&display=swap');

    /* BASE PRINT STYLES - Single Column (default) */
    body {
      font-family: 'Linux Libertine', 'Times New Roman', serif;
      line-height: 1.618;
      color: #000;
      max-width: 6.5in; /* Standard paper width */
      margin: 1in auto;
      padding: 0;
      background: #fff;
      font-size: 11pt;
      orphans: 3;
      widows: 3;
    }

    /* Page Setup */
    @page {
      margin: 1in;
      counter-increment: page;
    }
    @page :first {
      counter-reset: page 1; /* Start page count from 1, or just reset to 0 to skip title page */
    }
    .academic-paper::after {
      content: "Page " counter(page);
      position: fixed;
      bottom: 0.5in;
      right: 1in;
      font-size: 9pt;
      font-family: 'Source Serif Pro', sans-serif;
    }


    /* Typography and Layout */
    .paper-header {
      text-align: center;
      margin-bottom: 2em;
      padding-bottom: 1.5em;
      border-bottom: 1pt solid #000;
    }
    .paper-title {
      font-size: 18pt;
      font-weight: bold;
      margin: 0 0 1em;
      line-height: 1.2;
      font-variant: small-caps;
      letter-spacing: 0.5pt;
    }
    .paper-authors {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5em;
      margin-bottom: 0.75em;
    }
    .author-block {
      text-align: center;
      line-height: 1.3;
    }
    .author-name {
      font-weight: bold;
      font-size: 11pt;
    }
    .author-affiliation {
      font-style: italic;
      font-size: 10pt;
      font-weight: 300;
    }
    .paper-meta {
      color: #000;
      font-size: 10pt;
      letter-spacing: 0.5pt;
      text-transform: uppercase;
    }

    .paper-section {
      margin-bottom: 1.75em;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin: 1.5em 0 1em;
      padding-bottom: 0.5em;
      border-bottom: 0.5pt solid #000;
      font-variant: small-caps;
      letter-spacing: 0.5pt;
      page-break-after: avoid; /* Keep title with its content */
    }
    .abstract {
      font-style: italic;
      padding: 1em;
      margin: 1em 0;
      border-left: 3pt solid #000;
      background: #f8f8f8; /* Use light background for abstract */
      page-break-inside: avoid;
    }
    .paper-paragraph {
      margin-bottom: 1em;
      text-align: justify;
      hyphens: auto;
      text-indent: 0; /* Default no indent */
      page-break-inside: avoid;
    }

    .paper-paragraph:not(.abstract):first-of-type {
        text-indent: 1.5em; /* Standard paragraph indent */
    }

    /* References */
    .references {
      padding-left: 0; /* Align references to the margin */
      font-size: 10pt;
      list-style: none;
      page-break-before: always;
    }
    .reference-item {
      margin-bottom: 0.75em;
      text-indent: -2em;
      padding-left: 2em;
    }

    /* Footer */
    .paper-footer {
      margin-top: 2.5em;
      padding-top: 1em;
      border-top: 0.5pt solid #000;
      text-align: center;
      font-size: 9pt;
      page-break-before: avoid;
    }

    /* TWO-COLUMN MODE (Print only, based on user toggle) */
    .print-two-column {
      column-count: 2;
      column-gap: 0.75in;
      max-width: 8.5in; /* Increase width for better column look */
      margin: 0.75in auto;
      padding: 0;
    }

    .print-two-column .paper-header,
    .print-two-column .paper-section:first-child, /* Abstract */
    .print-two-column .references {
      column-span: all;
    }

    .print-two-column .section-title {
        margin-top: 1em; /* Adjust section spacing in columns */
    }
    .print-two-column .paper-paragraph {
        margin-bottom: 0.75em; /* Slightly tighter spacing in columns */
    }
  `

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.title} - Print</title>
      <style>${printStyles}</style>
    </head>
    <body>
    </body>
    </html>
  `)

  printWindow.document.body.appendChild(printArea)
  printWindow.document.close()
  printWindow.focus()

  // Use a short timeout to ensure content is rendered before printing
  setTimeout(() => {
    if (printWindow.print) {
      printWindow.print()
    }
  }, 500)
}


</script>

<style scoped>
/* 🖥️ SCREEN VIEW STYLES */

/* Container for non-print UI */
.academic-paper-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Linux Libertine', 'Times New Roman', serif;
}

/* Print Toolbar (not printed) */
.print-toolbar {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.print-btn {
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.print-btn:hover {
  background: #359b6a;
}

.layout-toggle {
  margin-top: 10px;
  text-align: right;
}

.layout-toggle button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}


/* Paper Content (Screen View) */
.academic-paper {
  padding: 40px 48px;
  line-height: 1.6;
  color: #333;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 12px;
  /* Default for screen is single column */
  column-count: 1;
  column-gap: normal;
}

/* Two Column Screen Mode */
.two-column {
  column-count: 2;
  column-gap: 2.5em;
  column-rule: 1px solid #e0e0e0;
  padding: 40px 30px;
  /* Adjust padding for two-column look */
}

.two-column .paper-paragraph {
  break-inside: avoid;
}

.two-column .paper-header,
.two-column .abstract,
.two-column .references,
.two-column .paper-footer {
  column-span: all;
}


/* Shared Screen Layout Styles */

.paper-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ddd;
}

.paper-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 16px;
  line-height: 1.3;
}

.paper-authors {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.author-block {
  text-align: center;
}

.author-name {
  font-weight: bold;
  font-size: 16px;
}

.author-affiliation {
  font-style: italic;
  font-size: 14px;
  color: #555;
}

.paper-meta {
  color: #666;
  font-size: 14px;
}

.paper-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.abstract {
  font-style: italic;
  padding: 12px 16px;
  background: #f9f9f9;
  border-left: 3px solid #42b883;
  margin-bottom: 20px;
}

.paper-paragraph {
  margin-bottom: 16px;
  text-align: justify;
}

.references {
  padding-left: 0;
  list-style: none;
}

.reference-item {
  margin-bottom: 8px;
  text-indent: -24px;
  padding-left: 24px;
  font-size: 14px;
}

.paper-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #666;
  font-size: 14px;
}


/* 📱 RESPONSIVE ADJUSTMENTS */
@media (max-width: 600px) {
  .academic-paper {
    padding: 20px 16px;
    column-count: 1;
    /* Force single column on small screens */
  }

  .paper-title {
    font-size: 24px;
  }

  .paper-authors {
    flex-direction: column;
    gap: 12px;
  }
}

/* 🖨️ PRINT MEDIA QUERY (Used only to hide screen elements and handle breaks) */
@media print {

  /* Hide UI elements from print */
  .print-toolbar,
  .layout-toggle {
    display: none !important;
  }

  /* Reset paper style for print */
  .academic-paper {
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Clear screen column mode which will be overridden by injected print style */
  .academic-paper.two-column {
    column-count: 1;
    column-gap: normal;
    column-rule: none;
  }

  /* Ensure page breaks are handled gracefully */
  h2,
  h3 {
    page-break-after: avoid;
  }

  .paper-paragraph,
  .abstract,
  .author-block {
    page-break-inside: avoid;
  }

  .references {
    page-break-before: always;
  }
}
</style>
