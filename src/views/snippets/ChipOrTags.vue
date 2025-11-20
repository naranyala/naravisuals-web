<script setup lang="ts">
defineProps<{
  color?: string
  removable?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()
defineEmits(['remove'])
</script>

<template>
  <span class="chip" :class="[size || 'md', { 'has-color': color }]" :style="{ background: color }">
    <slot />
    <button v-if="removable" @click="$emit('remove')" class="chip-remove">×</button>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #e5e7eb;
  font-size: 0.875rem;
}
.chip-remove {
  width: 20px; height: 20px;
  border: none; background: rgba(0,0,0,0.2);
  color: white; border-radius: 50%; cursor: pointer;
}
.sm { padding: 0.125rem 0.5rem; font-size: 0.75rem; }
</style>
