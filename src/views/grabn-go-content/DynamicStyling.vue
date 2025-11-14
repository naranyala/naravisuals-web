
<script setup>
import { ref } from 'vue'
const color = ref('#42b883')
</script>

<template>
  <button @click="color = color === '#42b883' ? '#35495e' : '#42b883'">
    Toggle Color
  </button>
</template>

<style scoped>
button {
  color: white;
  background-color: v-bind(color);
  padding: 8px 16px;
  border-radius: 8px;
}
</style>
