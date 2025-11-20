
<template>
  <div class="carousel">
    <button @click="prev">‹</button>
    <div class="slide">{{ items[current] }}</div>
    <button @click="next">›</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true }
})

const current = ref(0)
function next() { current.value = (current.value + 1) % props.items.length }
function prev() { current.value = (current.value - 1 + props.items.length) % props.items.length }
</script>

<style scoped>
.carousel { display: flex; align-items: center; gap: 1rem; }
.slide { min-width: 200px; text-align: center; }
</style>
