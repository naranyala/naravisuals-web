<script setup>
import { useCounter } from './useCounter'

const { value: count, increment, decrement } = useCounter(10)

// Use like a ref, but with validation
count.value = 20        // setter triggers validation
console.log(count.value) // getter: 20

// Or use methods
increment(5)
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment()">+1</button>
    <button @click="decrement()">-1</button>
    <button @click="count = 0">Reset via setter</button>
  </div>
</template>
