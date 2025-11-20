
<template>
  <div>
    <span v-for="i in max" :key="i" @click="$emit('update:modelValue', i)">
      {{ i <= modelValue ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 5 }
})
defineEmits(['update:modelValue'])
</script>
