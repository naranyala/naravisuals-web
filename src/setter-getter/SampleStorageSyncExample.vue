<script setup>
import { useStorageSync } from './useStorageSync'

// Store an object
const { value: userPrefs } = useStorageSync('user-prefs', {
  theme: 'light',
  notifications: true
})

// Set entire object
userPrefs.value = { theme: 'dark', notifications: false }

// Or mutate (still reactive due to ref)
userPrefs.value.theme = 'light'
</script>

<template>
  <div>
    <pre>{{ userPrefs }}</pre>
    <button @click="userPrefs.theme = 'dark'">Dark Mode</button>
  </div>
</template>
