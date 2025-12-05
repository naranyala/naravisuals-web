
// useDebouncedValue.js
import { ref } from 'vue'

export function useDebouncedValue(delay = 300, initial = '') {
  const value = ref(initial)
  const debounced = ref(initial)
  let timer = null

  function get() {
    return debounced.value
  }

  function set(v) {
    value.value = v
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = v
    }, delay)
  }

  return { get, set, value, debounced }
}
