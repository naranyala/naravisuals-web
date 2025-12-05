<template>
  <div>
    <div v-for="item in paginatedItems" :key="item.id">
      {{ item.name }}
    </div>

    <div class="pagination">
      <button @click="pagination.goToFirst()" :disabled="pagination.getCurrentPage() === 1">
        First
      </button>
      <button @click="pagination.prevPage()" :disabled="pagination.getCurrentPage() === 1">
        Prev
      </button>

      <button
        v-for="page in pagination.getVisiblePages"
        :key="page"
        @click="pagination.setPage(page)"
        :class="{ active: page === pagination.getCurrentPage() }"
      >
        {{ page }}
      </button>

      <button @click="pagination.nextPage()" :disabled="pagination.getCurrentPage() === pagination.getTotalPages()">
        Next
      </button>
      <button @click="pagination.goToLast()" :disabled="pagination.getCurrentPage() === pagination.getTotalPages()">
        Last
      </button>
    </div>

    <select v-model="itemsPerPage" @change="updatePerPage">
      <option value="5">5 per page</option>
      <option value="10">10 per page</option>
      <option value="20">20 per page</option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePagination } from './usePagination'

const allItems = ref([
  // Your data array here
])

const pagination = usePagination(allItems.value.length, { itemsPerPage: 10 })

const paginatedItems = computed(() => {
  const start = pagination.getOffset()
  const end = start + pagination.getPerPage()
  return allItems.value.slice(start, end)
})

const itemsPerPage = ref(10)

function updatePerPage() {
  pagination.setPerPage(parseInt(itemsPerPage.value))
}
</script>
