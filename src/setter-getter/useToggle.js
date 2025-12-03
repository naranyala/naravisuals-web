// composables/useToggle.js
import { ref, computed } from 'vue'

export function useToggle(initial = false) {
  const state = ref(initial)

  const value = computed({
    get: () => state.value,
    set: (newVal) => {
      state.value = Boolean(newVal)
    }
  })

  const toggle = () => (state.value = !state.value)
  const setTrue = () => (state.value = true)
  const setFalse = () => (state.value = false)

  return {
    value,     // writable computed: getter/setter
    toggle,
    setTrue,
    setFalse
  }
}
