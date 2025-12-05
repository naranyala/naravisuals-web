<script setup>
import { useScrollPercent } from './useScrollPercent'
const scroll = useScrollPercent()
</script>

<template>
  <div>Scrolled: {{ scroll.get() }}%</div>
</template>
