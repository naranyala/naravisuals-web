// composables/useTimer.ts
import { ref, onUnmounted } from 'vue'

export function useInterval(fn: () => void, ms: number | Ref<number>, autoStart = true) {
  let id: any
  const start = () => (id = setInterval(() => fn(), unref(ms)))
  const stop = () => clearInterval(id)

  if (autoStart) start()
  onUnmounted(stop)

  return { start, stop }
}

export function useTimeout(fn: () => void, ms: number | Ref<number>, autoStart = true) {
  let id: any
  const start = () => (id = setTimeout(() => fn(), unref(ms)))
  const stop = () => clearTimeout(id)

  if (autoStart) start()
  onUnmounted(stop)

  return { start, stop }
}
