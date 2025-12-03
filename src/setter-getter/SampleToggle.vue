<script setup>
import { useToggle } from './useToggle'

const { value: isVisible, toggle } = useToggle(false)

// Setter
isVisible.value = true

// Getter
console.log(isVisible.value) // true
</script>

<template>
  <div>
    <p v-if="isVisible">Secret content!</p>
    <button @click="toggle()">Toggle</button>
    <button @click="isVisible = !isVisible">Toggle via setter</button>
  </div>
</template>
