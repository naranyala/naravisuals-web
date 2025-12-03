<template>
  <div>
    <p>Is mobile: {{ isMobile.get() }}</p>
    <p>Is dark mode: {{ isDarkMode.get() }}</p>
    <p>Is landscape: {{ isLandscape.get() }}</p>
    <button @click="toggleDarkModeQuery">Toggle Dark Mode Query</button>
  </div>
</template>

<script setup>
import { useMediaQuery } from './useMediaQuery'

const isMobile = useMediaQuery('(max-width: 768px)')
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
const isLandscape = useMediaQuery('(orientation: landscape)')

function toggleDarkModeQuery() {
  const current = isDarkMode.get()
  isDarkMode.setQuery(`(prefers-color-scheme: ${current ? 'light' : 'dark'})`)
}
</script>
