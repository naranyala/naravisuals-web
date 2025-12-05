// composables/useAsyncState.js
import { ref } from 'vue'

export function useAsyncState(promiseFn, initialState = null) {
  const data = ref(initialState)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    try {
      data.value = await promiseFn(...args)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return [
    { data, loading, error },
    { execute }
  ]
}
