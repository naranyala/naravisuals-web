<script setup>
import { useDebouncedValue } from './useDebouncedValue'
const search = useDebouncedValue(300)
</script>

<template>
  <input @input="search.set($event.target.value)" />
  <p>Debounced: {{ search.get() }}</p>
</template>
