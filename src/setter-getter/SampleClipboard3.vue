<script setup>
import { useClipboard } from './useClipboard'
const clip = useClipboard()
</script>

<template>
  <button @click="clip.set('hello')">Copy "hello"</button>
  <p>Last copied: {{ clip.get() }}</p>
</template>
