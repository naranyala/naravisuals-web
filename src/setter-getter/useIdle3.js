
// useIdle.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useIdle(timeout = 3000) {
  const idle = ref(false)
  let timer = null

  function get() {
    return idle.value
  }

  function set(v) {
    idle.value = !!v
  }

  function resetTimer() {
    set(false)
    clearTimeout(timer)
    timer = setTimeout(() => set(true), timeout)
  }

  onMounted(() => {
    resetTimer()
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', resetTimer)
    window.removeEventListener('keydown', resetTimer)
  })

  return { get, set, idle }
}
