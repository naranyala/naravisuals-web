<script setup>
import { useRateLimit } from './useRateLimit'

const search = useRateLimit(1000, '')
</script>

<template>
  <input v-model="search.value" placeholder="type fast…">
  <p>Throttled: {{ search.get() }}</p>
</template>
