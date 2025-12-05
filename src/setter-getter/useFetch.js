// composables/useFetch.js
import { ref } from 'vue'

export function useFetch(url, options = {}) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchData = async (customUrl = null) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(customUrl || url, options)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data.value = await res.json()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch on creation if desired
  if (options.immediate !== false) fetchData()

  const refetch = (newUrl) => fetchData(newUrl)

  return [
    { data, error, loading }, // getter object
    refetch                   // setter/trigger
  ]
}
