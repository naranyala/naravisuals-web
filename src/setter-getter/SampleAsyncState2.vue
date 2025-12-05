<script setup>
import { useAsyncState } from './useAsyncState'

async function loadUser() {
  return new Promise(resolve => {
    setTimeout(() => resolve({ name: 'Evan', age: 36 }), 600)
  })
}

const user = useAsyncState(loadUser)
</script>

<template>
  <button @click="user.run()">Load User</button>
  <p v-if="user.loading">Loading...</p>
  <p v-else>{{ user.get() }}</p>
</template>
