<script setup>
import { useMapped } from './useMapped'

const price = useMapped(0, {
  get: v => v.toFixed(2),
  set: v => parseFloat(v) || 0
})
</script>

<template>
  <input v-model="price.value">
  <p>Raw number: {{ price.raw }}</p>
</template>
