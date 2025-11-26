// composables/useToggle.ts
import { ref } from 'vue'

export function useToggle(initial = false) {
  const state = ref(initial)
  const toggle = () => (state.value = !state.value)
  const setTrue = () => (state.value = true)
  const setFalse = () => (state.value = false)

  return { state, toggle, setTrue, setFalse }
}

