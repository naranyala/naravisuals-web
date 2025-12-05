<script setup>
import { useNumberRange } from './useNumberRange'
const zoom = useNumberRange(1, 10, 3)
</script>

<template>
  <p>Zoom: {{ zoom.get() }}</p>
  <button @click="zoom.dec()">-</button>
  <button @click="zoom.inc()">+</button>
  <button @click="zoom.set(5)">Reset to 5</button>
</template>
