<script setup>
import { usePressHold } from './usePressHold'
const hold = usePressHold(700)
</script>

<template>
  <button @mousedown="hold.onDown" @mouseup="hold.onUp">
    Hold Me
  </button>

  <p>Holding: {{ hold.get() }}</p>
</template>
