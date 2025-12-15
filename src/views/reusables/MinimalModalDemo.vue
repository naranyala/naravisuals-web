<template>
  <div class="app">
    <h1>Modal Demo</h1>
    <button @click="showModal = true">Open Modal</button>
    
    <Modal
      :open="showModal"
      title="Minimal Modal"
      content="This is a bare minimum modal. It's responsive and covers the full screen."
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'

const showModal = ref(false)
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}

.app {
  padding: 40px;
  text-align: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
