<script setup>
import { useQueue } from './useQueue2'

const todos = useQueue(['buy milk'])
todos.set(['walk dog']) // setter
console.log(todos.get()) // ["walk dog"]

todos.enqueue('code')
</script>

<template>
  <ul>
    <li v-for="(t, i) in todos.value" :key="i">{{ t }}</li>
  </ul>
  <button @click="todos.dequeue">Done</button>
</template>
