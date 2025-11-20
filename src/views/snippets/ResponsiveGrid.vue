
<template>
  <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  cols: { type: Number, default: 3 }
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}
</style>
