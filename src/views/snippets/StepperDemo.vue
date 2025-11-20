
<template>
  <div class="stepper">
    <div v-for="(step, i) in steps" :key="i" :class="{ active: i === current }">
      {{ step }}
    </div>
    <button @click="next" :disabled="current === steps.length - 1">Next</button>
    <button @click="prev" :disabled="current === 0">Back</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  steps: { type: Array, required: true }
})

const current = ref(0)
function next() { if (current.value < props.steps.length - 1) current.value++ }
function prev() { if (current.value > 0) current.value-- }
</script>

<style scoped>
.stepper { display: flex; gap: 1rem; }
.active { font-weight: bold; color: #42b983; }
</style>
