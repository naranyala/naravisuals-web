<script setup>
import { useQueryParam } from './useQueryParam2'
const page = useQueryParam('page')
</script>

<template>
  <button @click="page.set('2')">Go to page=2</button>
  <p>Query: {{ page.get() }}</p>
</template>
