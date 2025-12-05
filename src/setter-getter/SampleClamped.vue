<script setup>
import { useClamped } from './useClamped'

const qty = useClamped(5, { min: 1, max: 10 })
</script>

<template>
  <button @click="qty.set(qty.get() - 1)">-</button>
  {{ qty.value }}
  <button @click="qty.set(qty.get() + 1)">+</button>
</template>
