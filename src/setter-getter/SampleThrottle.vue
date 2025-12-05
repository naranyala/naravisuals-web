<script setup>
import { useThrottle } from './useThrottle'

const throttle = useThrottle(300)
</script>

<template>
  <input @input="throttle.set($event.target.value)" />
  <p>Throttled: {{ throttle.get() }}</p>
</template>
