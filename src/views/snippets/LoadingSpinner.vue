<!-- LoadingSpinner.vue -->
<script setup>
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: string
}>()
</script>

<template>
  <div class="spinner" :class="size || 'md'" :style="{ borderColor: color || '#3b82f6' }">
  </div>
</template>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.sm { width: 20px; height: 20px; border-width: 3px; }
.md { width: 40px; height: 40px; }
.lg { width: 60px; height: 60px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<!-- Skeleton.vue -->
<template>
  <div class="skeleton" :style="{ width, height }"></div>
</template>

<script setup>
defineProps<{
  width?: string
  height?: string
}>()
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}
@keyframes loading { to { background-position: -200% 0; } }
</style>
