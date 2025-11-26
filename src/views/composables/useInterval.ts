// composables/useInterval.ts
import { ref, onScopeDispose } from 'vue'

export function useInterval(callback: () => void, delay: number) {
  const isActive = ref(true)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const start = () => {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(callback, delay)
    isActive.value = true
  }

  const stop = () => {
    if (intervalId) clearInterval(intervalId)
    isActive.value = false
  }

  start()

  onScopeDispose(stop)

  return { isActive, start, stop }
}
