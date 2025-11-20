
<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['click']);
</script>

<template>
  <button @click="emit('click')">
    {{ text }}
  </button>
</template>
