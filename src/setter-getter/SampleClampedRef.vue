<script setup>
import { ref } from 'vue'
import { useClampedRef } from './useClampedRef'

const min = ref(0)
const max = ref(100)
const { value: brightness } = useClampedRef(50, min, max)

// Later: max.value = 80 → brightness auto-clamps to ≤80
</script>

<template>
  <div>
    <input type="range" v-model.number="min" min="0" max="50" />
    <input type="range" v-model.number="brightness" :min="min" :max="max" />
    <input type="range" v-model.number="max" min="50" max="100" />
    <p>Brightness: {{ brightness }}</p>
  </div>
</template>
