
<template>
  <button @click="$emit('clicked')">Click Me</button>
</template>

<script setup>
defineEmits(['clicked'])
</script>
