
<template>
  <div>
    <input v-model="message" placeholder="Type something..." />
    <p>You typed: {{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
</script>
