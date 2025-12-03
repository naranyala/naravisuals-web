<template>
  <div>
    <p>Theme: {{ themeState.get() }}</p>
    <button @click="toggleTheme">Toggle Theme</button>
    <button @click="resetTheme">Reset</button>
  </div>
</template>

<script setup>
import { useLocalStorage } from './useLocalStorage2'

const themeState = useLocalStorage('theme', 'light')

function toggleTheme() {
  themeState.set(themeState.get() === 'light' ? 'dark' : 'light')
}

function resetTheme() {
  themeState.remove()
}
</script>
