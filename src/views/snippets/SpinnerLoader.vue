
<script setup>
const props = defineProps({
  size: {
    type: String,
    default: '2rem',
  },
});
</script>

<template>
  <div class="spinner" :style="{ width: size, height: size }"></div>
</template>

<style scoped>
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #007bff;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
