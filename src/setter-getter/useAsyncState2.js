
// useAsyncState.js
import { ref } from 'vue'

export function useAsyncState(fn) {
  const loading = ref(false)
  const error = ref(null)
  const value = ref(null)

  function get() {
    return value.value
  }

  function set(v) {
    value.value = v
  }

  async function run(...args) {
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      set(result)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return { get, set, run, loading, error, value }
}
