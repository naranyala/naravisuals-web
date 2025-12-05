
// useFormField.js
import { ref } from 'vue'

export function useFormField(initial = '', validateFn = null) {
  const value = ref(initial)
  const error = ref(null)

  function get() {
    return value.value
  }

  function set(v) {
    value.value = v
    if (validateFn) {
      error.value = validateFn(v)
    }
  }

  function clear() {
    set('')
  }

  return { get, set, clear, error, value }
}
