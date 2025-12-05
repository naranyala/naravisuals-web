<script setup>
import { useBreakpoint } from './useBreakpoint'

const screen = useBreakpoint()
</script>

<template>
  <p>Breakpoint: {{ screen.get() }}</p>
</template>
