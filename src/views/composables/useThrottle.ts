// composables/useThrottle.ts
import { ref, watch, onScopeDispose } from 'vue'

export function useThrottle<T>(value: T, delay = 300) {
  const throttled = ref(value)
  let lastExec = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const schedule = () => {
    const now = Date.now()
    if (now - lastExec >= delay) {
      throttled.value = value
      lastExec = now
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        throttled.value = value
        lastExec = Date.now()
        timeoutId = null
      }, delay - (now - lastExec))
    }
  }

  watch(() => value, schedule)

  onScopeDispose(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  return throttled
}
