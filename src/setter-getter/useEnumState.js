// composables/useEnumState.js
import { ref, computed } from 'vue'

export function useEnumState(initial, allowedValues) {
  if (!allowedValues.includes(initial)) {
    throw new Error(`Initial value "${initial}" not in allowed values`)
  }

  const state = ref(initial)

  const value = computed({
    get: () => state.value,
    set: (newVal) => {
      if (!allowedValues.includes(newVal)) {
        console.warn(`Invalid value: "${newVal}". Allowed:`, allowedValues)
        return
      }
      state.value = newVal
    }
  })

  // Helper: check current state
  const is = (val) => state.value === val

  return { value, is }
}

