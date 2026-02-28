<script setup>
import { marked } from 'marked';
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const contentRef = ref(null);
const mermaidContainer = ref(null);
let mermaidInitialized = false;
let mathJaxInitialized = false;

const mermaidBlocks = [];

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

const renderContent = async () => {
  if (!contentRef.value) return;

  console.log('MarkdownRenderer content:', props.content?.substring(0, 100));

  if (!props.content || props.content.trim() === '') {
    contentRef.value.innerHTML = '<p>No content to display</p>';
    return;
  }

  const rawHtml = marked.parse(props.content);
  console.log('Parsed HTML length:', rawHtml?.length);

  const processedHtml = extractMermaidBlocks(rawHtml);
  contentRef.value.innerHTML = processedHtml;

  await nextTick();
  await renderMathJax();
  await renderMermaid();
};
</script>

<template>
  <div class="markdown-renderer">
    <div ref="contentRef" class="markdown-content"></div>
  </div>
</template>

<style scoped>
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
</style>
