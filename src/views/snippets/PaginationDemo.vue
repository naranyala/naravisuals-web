
<template>
  <div class="pagination">
    <button :disabled="page === 1" @click="$emit('update:page', page - 1)">Prev</button>
    <span>Page {{ page }} of {{ total }}</span>
    <button :disabled="page === total" @click="$emit('update:page', page + 1)">Next</button>
  </div>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, default: 1 }
})
defineEmits(['update:page'])
</script>

<style scoped>
.pagination { display: flex; gap: 1rem; align-items: center; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
