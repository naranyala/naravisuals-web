// composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: T, delay = 300) {
  const debounced = ref(value)

  let timeout: number
  watch(
    () => value,
    (val) => {
      clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        debounced.value = val
      }, delay)
    }
  )

  return debounced
}

