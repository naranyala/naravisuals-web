// ~/composables/useRateLimit.js
import { ref, computed } from 'vue'

export function useRateLimit(ms = 1000, initial = null) {
  const raw = ref(initial)
  let last = 0

  const value = computed({
    get() { return raw.value },
    set(v) {
      const now = Date.now()
      if (now - last >= ms) {
        raw.value = v
        last = now
      }
    }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
