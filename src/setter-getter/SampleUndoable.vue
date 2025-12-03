<script setup>
import { useUndoable } from './useUndoable'

const { value: content, undo, redo, canUndo, canRedo } = useUndoable('')
</script>

<template>
  <div>
    <textarea v-model="content"></textarea>
    <br />
    <button @click="undo" :disabled="!canUndo">↩️ Undo</button>
    <button @click="redo" :disabled="!canRedo">↪️ Redo</button>
  </div>
</template>
