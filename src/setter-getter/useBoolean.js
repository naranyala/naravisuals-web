// composables/useBoolean.js
import { ref, computed } from 'vue'

export function useBoolean(initial = false) {
  const state = ref(initial)

  const value = computed({
    get: () => state.value,
    set: (val) => {
      state.value = Boolean(val)
    }
  })

  return {
    value,
    setTrue: () => (state.value = true),
    setFalse: () => (state.value = false),
    toggle: () => (state.value = !state.value)
  }
}

