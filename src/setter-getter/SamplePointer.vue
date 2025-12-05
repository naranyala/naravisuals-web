<script setup>
import { usePointer } from './usePointer'
const pointer = usePointer()
</script>

<template>
  <p>{{ pointer.get().x }}, {{ pointer.get().y }}</p>
</template>
