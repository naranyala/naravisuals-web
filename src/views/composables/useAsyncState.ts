import {ref, onMounted} from "vue"

export function useAsyncState(fn, immediate = true) {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  async function run(...args) {
    loading.value = true
    error.value = null
    try {
      data.value = await fn(...args)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  if (immediate) onMounted(() => run())

  return { data, loading, error, run }
}

