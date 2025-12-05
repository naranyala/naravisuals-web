
// useThrottle.js
import { ref } from 'vue'

export function useThrottle(delay = 200) {
  const value = ref(null)
  let last = 0

  function get() {
    return value.value
  }

  function set(v) {
    const now = Date.now()
    if (now - last > delay) {
      value.value = v
      last = now
    }
  }

  return { get, set, value }
}
