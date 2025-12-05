<script setup>
import { useCycle } from './useCycle'

const { value, get, set, next, prev } = useCycle(['🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'])
</script>

<template>
  <button @click="prev">◀</button>
  <span @click="next">{{ value }}</span>
  <button @click="next">▶</button>
</template>
