<template>
  <div class="pagination">
    <button
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
      class="pagination-button"
    >
      Previous
    </button>
    
    <button
      v-for="page in visiblePages"
      :key="page"
      :class="['pagination-page', { active: page === currentPage }]"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <button
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
      class="pagination-button"
    >
      Next
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
    validator: (value) => value > 0
  },
  totalPages: {
    type: Number,
    required: true,
    validator: (value) => value > 0
  },
  maxVisible: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:currentPage', 'page-change'])

const visiblePages = computed(() => {
  const half = Math.floor(props.maxVisible / 2)
  let start = Math.max(props.currentPage - half, 1)
  let end = Math.min(start + props.maxVisible - 1, props.totalPages)
  
  // Adjust start if we're near the end
  start = Math.max(end - props.maxVisible + 1, 1)
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.pagination-button,
.pagination-page {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled),
.pagination-page:hover:not(.active) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style>
