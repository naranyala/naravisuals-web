<script setup>
import { useOnline } from './useOnline2'
const net = useOnline()
</script>

<template>
  <p>Online: {{ net.get() }}</p>
</template>
