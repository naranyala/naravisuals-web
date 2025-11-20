
<template>
  <button @click="toggle">{{ dark ? '🌙 Dark' : '☀️ Light' }}</button>
</template>

<script setup>
import { ref, watch } from 'vue'

const dark = ref(false)

function toggle() {
  dark.value = !dark.value
}

watch(dark, val => {
  document.documentElement.classList.toggle('dark', val)
})
</script>

<style>
.dark { background: #121212; color: #eee; }
</style>
