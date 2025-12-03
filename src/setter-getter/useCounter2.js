// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0, options = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options
  const count = ref(initialValue)

  const get = () => count.value

  const set = (value) => {
    // Clamp value between min and max
    const clampedValue = Math.max(min, Math.min(max, value))
    count.value = clampedValue
  }

  const increment = (amount = step) => {
    set(count.value + amount)
  }

  const decrement = (amount = step) => {
    set(count.value - amount)
  }

  const reset = () => {
    count.value = initialValue
  }

  const isMin = computed(() => count.value <= min)
  const isMax = computed(() => count.value >= max)

  return {
    get,
    set,
    increment,
    decrement,
    reset,
    isMin,
    isMax,
    count
  }
}
