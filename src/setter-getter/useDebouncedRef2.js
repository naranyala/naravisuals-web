// composables/useDebouncedRef.js
import { ref, customRef } from 'vue'

export function useDebouncedRef(value = '', delay = 300) {
  let timeout
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    }
  }))
}

// Or as a composable returning getter/setter:
export function useDebounce(initial = '', delay = 300) {
  const value = ref(initial)
  let timeout

  const setValue = (newVal) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      value.value = newVal
    }, delay)
  }

  return [value, setValue]
}
