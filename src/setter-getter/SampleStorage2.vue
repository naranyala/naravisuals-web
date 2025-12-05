<script setup>
import { useStorage } from './useStorage'

const username = useStorage('username', 'guest')
username.set('alice')      // setter
console.log(username.get()) // "alice"
</script>

<template>
  <input v-model="username.value" placeholder="name">
</template>
