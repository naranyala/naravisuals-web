// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initial = 0, { min = -Infinity, max = Infinity } = {}) {
  const count = ref(initial)

  const inc = (step = 1) => { count.value = Math.min(max, count.value + step) }
  const dec = (step = 1) => { count.value = Math.max(min, count.value - step) }
  const set = (val) => { count.value = Math.min(max, Math.max(min, val)) }
  const reset = () => { count.value = initial }

  const isMin = computed(() => count.value <= min)
  const isMax = computed(() => count.value >= max)

  return [
    { count: computed(() => count.value), isMin, isMax },
    { inc, dec, set, reset }
  ]
}
