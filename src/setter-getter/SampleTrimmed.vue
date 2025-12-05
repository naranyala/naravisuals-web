<script setup>
import { useTrimmed } from './useTrimmed'

const username = useTrimmed()
</script>

<template>
  <input v-model="username.value" placeholder="spaces will be removed">
  <pre>"{{ username.get() }}"</pre>
</template>
