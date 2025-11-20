<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  maxVisible?: number
}>()

const emit = defineEmits(['update:currentPage'])

const pages = computed(() => {
  const max = props.maxVisible || 7
  const pages = []
  let start = Math.max(1, props.currentPage - Math.floor(max / 2))
  let end = Math.min(props.totalPages, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<template>
  <nav class="pagination">
    <button :disabled="currentPage === 1" @click="emit('update:currentPage', currentPage - 1)">
      « Previous
    </button>

    <button v-if="pages[0] > 1" @click="emit('update:currentPage', 1)">1</button>
    <span v-if="pages[0] > 2">...</span>

    <button
      v-for="page in pages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="emit('update:currentPage', page)"
    >
      {{ page }}
    </button>

    <span v-if="pages[pages.length-1] < totalPages - 1">...</span>
    <button v-if="pages[pages.length-1] < totalPages" @click="emit('update:currentPage', totalPages)">
      {{ totalPages }}
    </button>

    <button :disabled="currentPage === totalPages" @click="emit('update:currentPage', currentPage + 1)">
      Next »
    </button>
  </nav>
</template>
