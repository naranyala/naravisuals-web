<template>
  <div>
    <p>Modal is {{ modalState.get() ? 'open' : 'closed' }}</p>
    <button @click="modalState.toggle()">Toggle</button>
    <button @click="modalState.on()">Open</button>
    <button @click="modalState.off()">Close</button>
  </div>
</template>

<script setup>
import { useToggle } from './useToggle2'

const modalState = useToggle(false)
</script>
