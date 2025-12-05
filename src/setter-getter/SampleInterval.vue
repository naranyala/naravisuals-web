<script setup>

import { useInterval } from "./useInterval.js"

let count = 0
const [running, { start, stop, toggle }] = useInterval(() => {
  console.log('tick', ++count)
}, 1000)
</script>

<template>
  <button @click="toggle">{{ running ? 'Stop' : 'Start' }} Timer</button>
</template>
