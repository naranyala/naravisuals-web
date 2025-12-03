// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)

  // Getter + Setter via writable computed
  const value = computed({
    get: () => count.value,
    set: (newVal) => {
      count.value = typeof newVal === 'number' ? newVal : initial
    }
  })

  const increment = (step = 1) => (count.value += step)
  const decrement = (step = 1) => (count.value -= step)
  const reset = () => (count.value = initial)

  return {
    value,        // <- getter/setter (writable computed)
    increment,
    decrement,
    reset
  }
}
