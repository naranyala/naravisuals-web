<script setup>
import { useCounter } from '@/composables/useCounter'

const [{ count, isMin, isMax }, { inc, dec, set, reset }] = useCounter(5, { min: 0, max: 10 })
</script>

<template>
  <div>
    <p>Count: {{ count }} (min: {{ isMin }}, max: {{ isMax }})</p>
    <button @click="dec" :disabled="isMin">-</button>
    <button @click="inc" :disabled="isMax">+</button>
    <button @click="set(7)">Set 7</button>
    <button @click="reset">Reset</button>
  </div>
</template>
