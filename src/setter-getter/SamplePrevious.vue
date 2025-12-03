<script setup>
import { ref } from 'vue'
import { usePrevious } from './usePrevious'

const count = ref(0)
const prevCount = usePrevious(count)

const increment = () => count.value++
</script>

<template>
  <div>
    <p>Current: {{ count }}</p>
    <p>Previous: {{ prevCount.value }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
