
<script setup>
import { ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const isVisible = ref(false);
</script>

<template>
  <div class="tooltip-container" @mouseenter="isVisible = true" @mouseleave="isVisible = false">
    <slot></slot>
    <div v-if="isVisible" class="tooltip">
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}
</style>
