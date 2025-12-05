<script setup>
import { useIdle } from './useIdle'
const idle = useIdle(2000)
</script>

<template>
  <p>User is idle: {{ idle.get() }}</p>
</template>
