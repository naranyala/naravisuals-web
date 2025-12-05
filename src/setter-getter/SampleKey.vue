<script setup>
import { useKey } from './useKey'
const shift = useKey('Shift')
</script>

<template>
  <p>Shift pressed: {{ shift.get() }}</p>
</template>
