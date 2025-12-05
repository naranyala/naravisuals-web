
// useKey.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useKey(targetKey = 'Shift') {
  const pressed = ref(false)

  function get() {
    return pressed.value
  }

  function set(v) {
    pressed.value = !!v
  }

  function down(e) {
    if (e.key === targetKey) set(true)
  }

  function up(e) {
    if (e.key === targetKey) set(false)
  }

  onMounted(() => {
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
  })

  return { get, set, pressed }
}
