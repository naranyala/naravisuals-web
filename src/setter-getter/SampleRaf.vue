<script setup>
import { useRaf } from './useRaf'

let count = 0
const raf = useRaf(() => count++)
</script>

<template>
  <button @click="raf.start()">Start</button>
  <button @click="raf.stop()">Stop</button>
  <p>Running: {{ raf.get() }}</p>
</template>
