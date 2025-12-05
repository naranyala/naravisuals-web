
// usePointer.js
import { ref, onMounted, onUnmounted } from 'vue'

export function usePointer() {
  const pos = ref({ x: 0, y: 0 })

  function get() {
    return pos.value
  }

  function set(x, y) {
    pos.value = { x, y }
  }

  function move(e) {
    set(e.clientX, e.clientY)
  }

  onMounted(() => window.addEventListener('mousemove', move))
  onUnmounted(() => window.removeEventListener('mousemove', move))

  return { get, set, pos }
}
