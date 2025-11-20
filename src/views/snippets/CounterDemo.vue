<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

const increment = () => count.value++
const decrement = () => count.value--

const isEven = computed(() => count.value % 2 === 0)
</script>

<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <p>{{ isEven ? 'Even' : 'Odd' }}</p>
    
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
    <button @click="count = 0">Reset</button>
  </div>
</template>

<style scoped>
.counter {
  text-align: center;
  padding: 2rem;
}
button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
}
</style>
