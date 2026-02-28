<template>
  <div class="doc-container">
    <article ref="contentRef" class="doc">
      <h1>Developer Learning Notes</h1>
      <p>
        This component demonstrates <strong>MathJax</strong> and <strong>Mermaid</strong>
        rendered using <em>ESM imports</em> inside a single-file Vue component.
      </p>
      <h2>Math Example</h2>
      <p>
        Inline math: $E = mc^2$
      </p>
      <p>
        Display math:
      </p>
      <p>
        $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
      </p>
      <h2>Mermaid Diagram</h2>
      <div ref="mermaidContainer" class="mermaid-wrapper"></div>
      <h2>Why SVG-based Rendering?</h2>
      <ul>
        <li>Scales perfectly with zoom</li>
        <li>Exports cleanly to PNG or PDF</li>
        <li>Matches roadmap / mindmap visuals</li>
      </ul>
    </article>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const contentRef = ref(null);
const mermaidContainer = ref(null);

const mermaidCode = `flowchart LR
  A[JavaScript Basics] --> B[Vue Fundamentals]
  B --> C[Composition API]
  C --> D[State Management]
  D --> E[Advanced Patterns]`;

onMounted(async () => {
  // Configure MathJax BEFORE loading the script
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
        renderMath();
      },
    },
  };

  // Load MathJax script dynamically
  const mathScript = document.createElement('script');
  mathScript.src =
    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js';
  mathScript.async = true;
  document.head.appendChild(mathScript);

  // Load Mermaid from CDN script tag (more reliable)
  const mermaidScript = document.createElement('script');
  mermaidScript.src =
    'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  mermaidScript.onload = () => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    renderMermaid();
  };
  document.head.appendChild(mermaidScript);
});

function renderMath() {
  if (window.MathJax && contentRef.value) {
    window.MathJax.typesetPromise([contentRef.value]).catch((err) => {
      console.error('MathJax error:', err);
    });
  }
}

async function renderMermaid() {
  if (!window.mermaid || !mermaidContainer.value) return;

  try {
    const { svg } = await window.mermaid.render('mermaid-diagram', mermaidCode);
    mermaidContainer.value.innerHTML = svg;
  } catch (err) {
    console.error('Mermaid error:', err);
    mermaidContainer.value.innerHTML =
      '<p style="color: red;">Error rendering diagram</p>';
  }
}
</script>

<style scoped>
.doc-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.doc {
  line-height: 1.7;
}
.mermaid-wrapper {
  background: #f6f8fa;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
}
pre {
  background: #f6f8fa;
  padding: 12px;
  overflow-x: auto;
  border-radius: 4px;
}
</style>
