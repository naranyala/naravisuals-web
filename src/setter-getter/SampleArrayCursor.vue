<script setup>
import { useArrayCursor } from './useArrayCursor'

const slides = useArrayCursor(['A', 'B', 'C', 'D'])
</script>

<template>
  <p>Current: {{ slides.get() }}</p>
  <button @click="slides.prev()">Prev</button>
  <button @click="slides.next()">Next</button>
</template>
