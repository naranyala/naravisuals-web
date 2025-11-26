// composables/useTimeout.ts
import { onUnmounted } from 'vue'

export function useTimeout(delay, callback) {
  let id = null

  function start() {
    id = setTimeout(callback, delay)
  }

  function clear() {
    if (id) clearTimeout(id)
  }

  onUnmounted(clear)

  return { start, clear }
}

