<script setup>
import { useQueue } from './useQueue3'
const queue = useQueue(['task1'])
</script>

<template>
  <p>Queue: {{ queue.get() }}</p>
  <button @click="queue.enqueue('task2')">Add</button>
  <button @click="queue.dequeue()">Remove</button>
</template>
