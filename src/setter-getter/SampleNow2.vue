<script setup>
import { useNow } from '~/composables/useNow'

const now = useNow(1000)
</script>

<template>
  <p>{{ new Date(now.get()).toLocaleTimeString() }}</p>
  <button @click="now.set(Date.now() - 3600_000)">One hour ago</button>
</template>
