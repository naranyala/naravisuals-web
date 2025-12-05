// usePagination.js
import { ref, computed } from 'vue'

export function usePagination(totalItems, options = {}) {
  const {
    itemsPerPage = 10,
    initialPage = 1,
    maxVisiblePages = 5
  } = options

  const currentPage = ref(initialPage)
  const perPage = ref(itemsPerPage)

  const getCurrentPage = () => currentPage.value
  const getPerPage = () => perPage.value
  const getTotalPages = () => Math.ceil(totalItems / perPage.value)

  const setPage = (page) => {
    const totalPages = getTotalPages()
    if (page >= 1 && page <= totalPages) {
      currentPage.value = page
    }
  }

  const setPerPage = (newPerPage) => {
    perPage.value = newPerPage
    // Adjust current page if it becomes invalid
    const totalPages = getTotalPages()
    if (currentPage.value > totalPages) {
      currentPage.value = totalPages || 1
    }
  }

  const nextPage = () => {
    if (currentPage.value < getTotalPages()) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const goToFirst = () => {
    currentPage.value = 1
  }

  const goToLast = () => {
    currentPage.value = getTotalPages()
  }

  const getVisiblePages = computed(() => {
    const total = getTotalPages()
    const half = Math.floor(maxVisiblePages / 2)
    let start = currentPage.value - half
    let end = currentPage.value + half

    if (start < 1) {
      start = 1
      end = Math.min(maxVisiblePages, total)
    }

    if (end > total) {
      end = total
      start = Math.max(1, total - maxVisiblePages + 1)
    }

    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  const getOffset = computed(() => {
    return (currentPage.value - 1) * perPage.value
  })

  return {
    getCurrentPage,
    getPerPage,
    getTotalPages,
    getVisiblePages,
    getOffset,
    setPage,
    setPerPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    currentPage,
    perPage
  }
}
