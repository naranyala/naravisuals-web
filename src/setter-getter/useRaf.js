
// useRaf.js
import { ref, onUnmounted } from 'vue'

export function useRaf(callback) {
  const running = ref(false)
  let id = null

  function get() {
    return running.value
  }

  function set(v) {
    running.value = !!v
  }

  function loop() {
    if (!running.value) return
    callback()
    id = requestAnimationFrame(loop)
  }

  function start() {
    if (running.value) return
    set(true)
    id = requestAnimationFrame(loop)
  }

  function stop() {
    set(false)
    cancelAnimationFrame(id)
  }

  onUnmounted(stop)

  return { get, set, start, stop, running }
}
