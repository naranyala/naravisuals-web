// useToggle.js
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const state = ref(initialValue)

  const get = () => state.value

  const set = (value) => {
    // Accept boolean or function for computed toggle
    if (typeof value === 'function') {
      state.value = value(state.value)
    } else {
      state.value = value
    }
  }

  const toggle = () => {
    state.value = !state.value
  }

  const on = () => {
    state.value = true
  }

  const off = () => {
    state.value = false
  }

  return {
    get,
    set,
    toggle,
    on,
    off,
    state // reactive ref for template
  }
}
