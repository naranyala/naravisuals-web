// composables/useDebouncedRef.js
import { ref, computed, watch } from 'vue'

export function useDebouncedRef(initialValue = '', delay = 300) {
  const raw = ref(initialValue)
  const debounced = ref(initialValue)

  watch(raw, (newVal) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })

  let timeoutId = null

  // Getter: immediate raw value (for UI)
  // Setter: writes to raw → triggers debounce
  const value = computed({
    get: () => raw.value,
    set: (newVal) => {
      raw.value = newVal
    }
  })

  // Expose the *debounced* value separately (for logic)
  return {
    value,        // immediate (getter/setter for input binding)
    debouncedValue: debounced, // delayed version (getter only)
    flush: () => {
      debounced.value = raw.value
      clearTimeout(timeoutId)
    }
  }
}
