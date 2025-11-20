<script setup lang="ts">
const model = defineModel<number>({ default: 0 })
const props = defineProps<{ max?: number; readonly?: boolean }>()
const hover = ref(0)

const setRating = (val: number) => { if (!props.readonly) model.value = val }
</script>

<template>
  <div class="rating">
    <span 
      v-for="i in (max || 5)" 
      :key="i"
      class="star"
      :class="{ filled: i <= (hover || model) }"
      @click="set	notRating(i)"
      @mouseenter="hover = i"
      @mouseleave="hover = 0"
    >★</span>
  </div>
</template>

<style scoped>
.rating { font-size: 2rem; }
.star { cursor: pointer; color: #e5e7eb; transition: color 0.2s; }
.star.filled { color: #fbbf24; }
</style>
