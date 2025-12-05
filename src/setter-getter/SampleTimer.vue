<script setup>
import { useTimer } from './useTimer'
const timer = useTimer()
</script>

<template>
  <div>{{ timer.get() }} ms</div>
  <button @click="timer.start()">Start</button>
  <button @click="timer.stop()">Stop</button>
  <button @click="timer.reset()">Reset</button>
</template>
