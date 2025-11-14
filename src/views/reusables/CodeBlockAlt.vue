<template>
  <div class="code-block">
    <!-- Header -->
    <div class="code-header">
      <span class="lang">{{ language }}</span>
      <button
        class="copy-btn"
        @click="copy"
        :disabled="copying"
        :title="copied ? 'Copied!' : 'Copy to clipboard'"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <!-- Highlighted code -->
    <pre><code :class="`language-${language}`" v-html="highlighted"></code></pre>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Prism from 'prismjs'

// --- Languages (add more as needed) ---
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-c'
import 'vue-prism'

// --- Theme ---
import 'prismjs/themes/prism-okaidia.css'  // or any dark theme

// --- Props ---
const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'text' }
})

// --- Highlighting ---
const highlighted = ref('')

function highlight() {
  const grammar = Prism.languages[props.language] || Prism.languages.text
  highlighted.value = Prism.highlight(props.code, grammar, props.language)
}
onMounted(highlight)
watch(() => [props.code, props.language], highlight)

// --- Copy logic ---
const copying = ref(false)
const copied = ref(false)

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
    if (document.execCommand('copy')) copied.value = true
  } catch (e) { console.error('Copy failed:', e) }
  finally { document.body.removeChild(el) }
}
</script>

<style scoped>
.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;

  /* Clean, visible border for dark themes */
  border: 1px solid #444;           /* Subtle dark gray */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);  /* Soft shadow for depth */
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: #2d2d2d;
  color: #bbb;
  font-size: 0.8rem;
  border-bottom: 1px solid #444;    /* Separator line */
}

.lang { text-transform: uppercase; }

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8rem;
}
.copy-btn:hover { color: #fff; }
.copy-btn:disabled { color: #4ade80; cursor: default; }

pre { margin: 0; padding: 1rem; overflow-x: auto; }
</style>
