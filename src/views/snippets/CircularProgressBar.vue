<!-- ProgressLinear.vue -->
<script setup lang="ts">
defineProps<{
  value: number  // 0-100
  color?: string
  height?: string
  indeterminate?: boolean
}>()
</script>

<template>
  <div class="progress-linear" :style="{ height: height || '6px' }">
    <div 
      class="progress-fill" 
      :class="{ indeterminate }"
      :style="{ width: indeterminate ? '100%' : `${value}%`, background: color || '#3b82f6' }"
    ></div>
  </div>
</template>

<style scoped>
.progress-linear {
  width: 100%;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.4s ease;
}
.indeterminate {
  animation: indeterminate 2s linear infinite;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
