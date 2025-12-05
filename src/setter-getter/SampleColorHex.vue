<script setup>
import { useColorHex } from './useColorHex'

const accent = useColorHex('#ff00ff')
</script>

<template>
  <input v-model="accent.value">
  <p :style="{ color: accent.get() }">Sample text</p>
</template>
