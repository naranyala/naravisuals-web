<script setup>
import { useLocalStorage } from './useLocalStorage'

const { value: theme } = useLocalStorage('user-theme', 'light')

// Set via assignment
theme.value = 'dark'

// Or via explicit setter (if you prefer)
// theme.setValue('dark')
</script>

<template>
  <div :class="theme">
    <p>Current theme: {{ theme }}</p>
    <button @click="theme = 'light'">Light</button>
    <button @click="theme = 'dark'">Dark</button>
  </div>
</template>
