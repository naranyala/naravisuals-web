<template>
  <div>
    <p>Count: {{ counter.get() }}</p>
    <button @click="counter.decrement()" :disabled="counter.isMin">-</button>
    <button @click="counter.increment()" :disabled="counter.isMax">+</button>
    <button @click="counter.increment(5)">+5</button>
    <button @click="counter.reset()">Reset</button>
  </div>
</template>

<script setup>
import { useCounter } from './useCounter2'

const counter = useCounter(0, { min: 0, max: 20, step: 1 })
</script>
