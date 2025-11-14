<script setup>
import { ref, onMounted, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import common language support
const props = defineProps({
  label: { type: String, require: true }, 
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' }
})

const codeRef = ref(null)
const copying = ref(false)
const copied = ref(false)
const lineCount = ref(1)

// Highlight code
function highlightCode() {
  if (codeRef.value) {
    codeRef.value.textContent = props.code
    Prism.highlightElement(codeRef.value)
    // Calculate line count
    lineCount.value = props.code.split('\n').length
  }
}

// Copy logic
async function copy() {
  if (copying.value) return
  copying.value = true
  copied.value = false
  
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
  } catch {
    fallbackCopy()
  } finally {
    setTimeout(() => {
      copying.value = false
      setTimeout(() => copied.value = false, 1500)
    }, 300)
  }
}

function fallbackCopy() {
  const el = document.createElement('textarea')
  el.value = props.code
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  
  try {
    if (document.execCommand('copy')) {
      copied.value = true
    }
  } catch (e) {
    console.error('Copy failed:', e)
  } finally {
    document.body.removeChild(el)
  }
}

onMounted(() => {
  highlightCode()
})

watch(() => props.code, () => {
  highlightCode()
})

watch(() => props.language, () => {
  highlightCode()
})
</script>


<template>
  <div class="code-block">
    <!-- Header -->
    <div class="code-header">
      <span class="lang">{{ props?.label || "example"  }}</span>
      <button
        class="copy-btn"
        @click="copy"
        :disabled="copying"
        :title="copied ? 'Copied!' : 'Copy to clipboard'"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="copy-text">{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <!-- Code with line numbers -->
    <div class="code-container">
      <div class="line-numbers" aria-hidden="true">
        <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
      </div>
      <pre class="code-pre"><code ref="codeRef" :class="`language-${language}`"></code></pre>
    </div>
  </div>
</template>


<style scoped>
.code-block {
  background: #1a1b26;
  border-radius: 10px;
  overflow: hidden;
  font-family: 'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  border: 1px solid #2a2d3a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: border-color 0.2s ease;
}

.code-block:hover {
  border-color: #3d4152;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #16161e;
  border-bottom: 1px solid #2a2d3a;
  color: #7aa2f7;
  font-size: 0.85rem;
}

.lang {
  /* text-transform: uppercase; */
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #2a2d3a;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  color: #9aa5ce;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.copy-btn:hover:not(:disabled) {
  color: #c0caf5;
  background: #24283b;
  border-color: #3d4152;
}

.copy-btn:disabled {
  color: #4ade80;
  border-color: #4ade80;
  cursor: default;
}

.copy-btn svg {
  flex-shrink: 0;
}

.copy-text {
  font-weight: 500;
}

.code-container {
  display: flex;
  background: #1a1b26;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  padding-left: 1rem;
  padding-right: 0.75rem;
  background: #16161e;
  border-right: 1px solid #2a2d3a;
  user-select: none;
  text-align: right;
  min-width: 3rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #565f89;
}

.line-number {
  display: block;
  font-family: 'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
}

.code-pre {
  margin: 0;
  padding: 1.25rem;
  padding-left: 1rem;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.6;
  background: #1a1b26;
  flex: 1;
}

.code-pre::-webkit-scrollbar {
  height: 8px;
}

.code-pre::-webkit-scrollbar-track {
  background: #16161e;
  border-radius: 4px;
}

.code-pre::-webkit-scrollbar-thumb {
  background: #2a2d3a;
  border-radius: 4px;
}

.code-pre::-webkit-scrollbar-thumb:hover {
  background: #3d4152;
}

/* Override Prism theme colors for better dark mode */
:deep(.token.comment),
:deep(.token.prolog),
:deep(.token.doctype),
:deep(.token.cdata) {
  color: #565f89;
}

:deep(.token.punctuation) {
  color: #c0caf5;
}

:deep(.token.property),
:deep(.token.tag),
:deep(.token.boolean),
:deep(.token.number),
:deep(.token.constant),
:deep(.token.symbol),
:deep(.token.deleted) {
  color: #ff9e64;
}

:deep(.token.selector),
:deep(.token.attr-name),
:deep(.token.string),
:deep(.token.char),
:deep(.token.builtin),
:deep(.token.inserted) {
  color: #9ece6a;
}

:deep(.token.operator),
:deep(.token.entity),
:deep(.token.url),
:deep(.language-css .token.string),
:deep(.style .token.string) {
  color: #89ddff;
}

:deep(.token.atrule),
:deep(.token.attr-value),
:deep(.token.keyword) {
  color: #bb9af7;
}

:deep(.token.function),
:deep(.token.class-name) {
  color: #7aa2f7;
}

:deep(.token.regex),
:deep(.token.important),
:deep(.token.variable) {
  color: #e0af68;
}
</style>
