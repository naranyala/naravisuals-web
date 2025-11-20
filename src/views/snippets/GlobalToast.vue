<!-- ToastContainer.vue — put once in App.vue -->
<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <TransitionGroup
    tag="div"
    name="toast"
    class="toast-container"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
      @click="removeToast(toast.id)"
    >
      <p>{{ toast.message }}</p>
      <button class="close">×</button>
    </div>
  </TransitionGroup>
</template>
