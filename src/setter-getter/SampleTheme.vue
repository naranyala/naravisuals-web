<template>
  <div class="themed-component">
    <h3>Theme Manager</h3>

    <div class="theme-selector">
      <button v-for="themeName in Object.keys(themeManager.getThemes())" :key="themeName"
        @click="themeManager.set(themeName)" :class="{ active: themeManager.get() === themeName }">
        {{ themeName }}
      </button>
    </div>

    <button @click="themeManager.toggle()">Toggle Dark/Light</button>

    <div class="custom-theme">
      <h4>Custom Theme</h4>
      <input v-model="customThemeName" placeholder="Theme name" />
      <button @click="addCustomTheme">Add Custom Theme</button>
      <button @click="removeCustomTheme">Remove Current</button>
    </div>

    <div class="current-vars">
      <h4>Current Theme Variables:</h4>
      <pre>{{ JSON.stringify(themeManager.getThemeVars(), null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from './useTheme'

const themeManager = useTheme('light')
const customThemeName = ref('')

function addCustomTheme() {
  if (customThemeName.value.trim()) {
    themeManager.addTheme(customThemeName.value, {
      '--bg-color': '#f0f8ff',
      '--text-color': '#2c3e50',
      '--primary-color': '#3498db',
      '--secondary-color': '#95a5a6'
    })
    customThemeName.value = ''
  }
}

function removeCustomTheme() {
  const currentTheme = themeManager.get()
  if (currentTheme !== 'light' && currentTheme !== 'dark') {
    themeManager.removeTheme(currentTheme)
  }
}
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #007bff;
  --secondary-color: #6c757d;
}

.themed-component {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 20px;
  border: 2px solid var(--primary-color);
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 5px;
  cursor: pointer;
  border-radius: 4px;
}

button.active {
  background-color: var(--secondary-color);
}

.current-vars {
  margin-top: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
</style>
