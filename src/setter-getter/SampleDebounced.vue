<script setup>
import { useDebounced } from '~/composables/useDebounced'

const search = useDebounced(400)
</script>

<template>
  <input v-model="search.raw" placeholder="type fast…">
  <p>Debounced: {{ search.value }}</p>
</template>
