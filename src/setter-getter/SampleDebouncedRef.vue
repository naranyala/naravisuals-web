<script setup>
import { useDebouncedRef } from './useDebouncedRef'

const { value: query, debouncedValue } = useDebouncedRef('', 500)

// Watch debounced value to fetch
// (in real app, use `watch(debouncedValue, fetchResults)`)
</script>

<template>
  <input v-model="query" placeholder="Search..." />
  <p>Typing: "{{ query }}"</p>
  <p>Debounced: "{{ debouncedValue }}"</p>
</template>
