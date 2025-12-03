// useState.js
import { ref, readonly } from 'vue'

export function useState(initialValue) {
  const state = ref(initialValue)

  const get = () => state.value

  const set = (newValue) => {
    state.value = newValue
  }

  const reset = () => {
    state.value = initialValue
  }

  return {
    get,
    set,
    reset,
    // Provide read-only state for template usage if needed
    state: readonly(state)
  }
}
