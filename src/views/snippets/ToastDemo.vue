<!-- ToastContainer.vue -->
<template>
  <div class="toast-container">
    <ToastItem
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
      @remove="removeToast"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ToastItem from './ToastItem.vue'

const toasts = ref([])

let nextId = 1

const addToast = (message, type = 'info', duration = 5000) => {
  const id = nextId++
  const toast = {
    id,
    message,
    type,
    duration
  }
  
  toasts.value.push(toast)
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  return id
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

const clearToasts = () => {
  toasts.value = []
}

// Expose methods to parent component
defineExpose({
  addToast,
  removeToast,
  clearToasts
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}
</style>
