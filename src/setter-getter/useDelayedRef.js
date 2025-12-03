// composables/useDelayedRef.js
import { ref, computed } from 'vue'

export function useDelayedRef(initialValue = '', delayMs = 0, mode = 'write') {
  // mode: 'write' = delay setter, 'read' = delay getter
  const immediate = ref(initialValue)
  const delayed = ref(initialValue)
  let timeoutId = null

  const value = computed({
    get() {
      return mode === 'read' ? delayed.value : immediate.value
    },
    set(newVal) {
      if (mode === 'write') {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          delayed.value = newVal
        }, delayMs)
        immediate.value = newVal
      } else {
        immediate.value = newVal
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          delayed.value = newVal
        }, delayMs)
      }
    }
  })

  const commit = () => {
    delayed.value = immediate.value
    clearTimeout(timeoutId)
  }

  return {
    value, // behaves differently based on mode
    delayedValue: delayed,
    immediateValue: immediate,
    commit
  }
}




