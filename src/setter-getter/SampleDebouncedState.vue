<template>
  <div>
    <input v-model="searchQuery" placeholder="Search..." />
    <p>Instant: {{ search.get() }}</p>
    <p>Debounced: {{ search.getDebounced() }}</p>
    <button @click="search.cancel()">Cancel</button>
    <button @click="search.flush()">Flush</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDebouncedState } from './useDebouncedState'

const search = useDebouncedState('', 500)

// Two-way binding with v-model
const searchQuery = computed({
  get: () => search.get(),
  set: (value) => search.set(value)
})
</script>
