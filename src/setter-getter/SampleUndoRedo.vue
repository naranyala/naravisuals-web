<template>
  <div>
    <textarea v-model="text" @input="handleInput"></textarea>
    <div>
      <button @click="undo" :disabled="!canUndo">Undo</button>
      <button @click="redo" :disabled="!canRedo">Redo</button>
      <button @click="clear">Clear History</button>
    </div>
    <p>History: {{ getCurrentIndex + 1 }}/{{ getHistory.length }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUndoRedo } from './useUndoRedo'

const textHistory = useUndoRedo('')
const { get: getText, set: setText, undo, redo, canUndo, canRedo, clearHistory, getHistory, getCurrentIndex } = textHistory

const text = computed({
  get: () => getText(),
  set: (value) => setText(value)
})

function handleInput() {
  // Debounce or throttle in real implementation
  setText(text.value)
}
</script>
