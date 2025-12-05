// composables/useInterval.js
import { ref, onUnmounted } from 'vue'

export function useInterval(fn, delay = 1000, options = {}) {
  const { immediate = true } = options
  const active = ref(immediate)
  let interval = null

  const start = () => {
    if (interval) return
    interval = setInterval(fn, delay)
    active.value = true
  }

  const stop = () => {
    if (interval) clearInterval(interval)
    interval = null
    active.value = false
  }

  const toggle = () => active.value ? stop() : start()

  if (immediate) start()

  onUnmounted(stop)

  return [
    active,
    { start, stop, toggle }
  ]
}
