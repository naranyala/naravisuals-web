
// useTimer.js
import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const ms = ref(0)
  let id = null

  function get() {
    return ms.value
  }

  function set(v) {
    ms.value = v
  }

  function start() {
    if (id) return
    id = setInterval(() => ms.value += 100, 100)
  }

  function stop() {
    clearInterval(id)
    id = null
  }

  function reset() {
    ms.value = 0
  }

  onUnmounted(stop)

  return { get, set, start, stop, reset, ms }
}
