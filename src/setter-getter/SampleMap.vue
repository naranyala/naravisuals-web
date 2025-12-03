<template>
  <div>
    <h3>User Preferences</h3>
    <div v-for="[key, value] in preferences.getEntries()" :key="key">
      {{ key }}: {{ value }}
      <button @click="removePreference(key)">Remove</button>
    </div>
    <input v-model="newKey" placeholder="Key" />
    <input v-model="newValue" placeholder="Value" />
    <button @click="addPreference">Add</button>
    <button @click="clearAll">Clear All</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMap } from './useMap'

const preferences = useMap({
  theme: 'dark',
  notifications: true,
  language: 'en'
})

const newKey = ref('')
const newValue = ref('')

function addPreference() {
  if (newKey.value && newValue.value) {
    preferences.set(newKey.value, newValue.value)
    newKey.value = ''
    newValue.value = ''
  }
}

function removePreference(key) {
  preferences.remove(key)
}

function clearAll() {
  preferences.clear()
}
</script>
