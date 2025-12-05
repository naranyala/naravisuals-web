
// useNumberRange.js
import { ref } from 'vue'

export function useNumberRange(min = 0, max = 100, initial = min) {
  const value = ref(initial)

  function clamp(v) {
    return Math.min(max, Math.max(min, v))
  }

  function get() {
    return value.value
  }

  function set(v) {
    value.value = clamp(v)
  }

  function inc(step = 1) {
    value.value = clamp(value.value + step)
  }

  function dec(step = 1) {
    value.value = clamp(value.value - step)
  }

  return { get, set, inc, dec, value }
}
