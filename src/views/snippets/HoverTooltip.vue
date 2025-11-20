
<template>
  <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <div v-if="show" class="tooltip">{{ text }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: { type: String, required: true }
})

const show = ref(false)
</script>

<style scoped>
.tooltip-wrapper { position: relative; display: inline-block; }
.tooltip {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  background: black; color: white; padding: 4px 8px; border-radius: 4px;
  white-space: nowrap;
}
</style>
