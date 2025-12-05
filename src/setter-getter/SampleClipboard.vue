<template>
  <div>
    <h3>Clipboard Manager</h3>

    <div v-if="!clipboard.isSupported()" class="warning">
      Clipboard API not supported in this browser
    </div>

    <div v-else>
      <div class="clipboard-actions">
        <textarea v-model="textToCopy" placeholder="Text to copy"></textarea>
        <button @click="copyText" :disabled="!textToCopy">Copy to Clipboard</button>
        <button @click="pasteText">Paste from Clipboard</button>
      </div>

      <div v-if="clipboard.getError()" class="error">
        Error: {{ clipboard.getError() }}
      </div>

      <div class="current">
        <strong>Current:</strong> {{ clipboard.get() }}
      </div>

      <div class="history">
        <h4>Clipboard History:</h4>
        <button @click="clipboard.clearHistory()">Clear History</button>
        <div v-for="(item, index) in clipboard.getHistory()" :key="index" :class="item.type">
          {{ item.type.toUpperCase() }}: {{ item.text }}
          ({{ item.timestamp.toLocaleTimeString() }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClipboard } from './useClipboard'

const clipboard = useClipboard()
const textToCopy = ref('')

async function copyText() {
  if (textToCopy.value.trim()) {
    const success = await clipboard.write(textToCopy.value)
    if (success) {
      alert('Copied to clipboard!')
      textToCopy.value = ''
    }
  }
}

async function pasteText() {
  const text = await clipboard.read()
  if (text) {
    textToCopy.value = text
  }
}
</script>

<style scoped>
.warning {
  color: #856404;
  background: #fff3cd;
  padding: 10px;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
}

.error {
  color: #721c24;
  background: #f8d7da;
  padding: 10px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 10px 0;
}

.clipboard-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 60px;
}

.current {
  margin: 20px 0;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  word-break: break-all;
}

.history {
  margin-top: 20px;
}

.history div {
  padding: 5px;
  margin: 5px 0;
  border-left: 3px solid #ccc;
}

.history div.written {
  border-left-color: #28a745;
}

.history div.read {
  border-left-color: #007bff;
}
</style>
