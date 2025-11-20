
<script setup>
const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:currentPage']);

const goToPage = (page) => {
  emit('update:currentPage', page);
};
</script>

<template>
  <div class="pagination">
    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :class="{ active: currentPage === page }"
    >
      {{ page }}
    </button>
  </div>
</template>

<style scoped>
.pagination button {
  margin: 0 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
.pagination button.active {
  background: #007bff;
  color: white;
}
</style>
