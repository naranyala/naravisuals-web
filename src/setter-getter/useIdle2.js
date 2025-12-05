// composables/useIdle.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useIdle(timeout = 60000) {
  const isIdle = ref(false)
  let timer

  const reset = () => {
    clearTimeout(timer)
    isIdle.value = false
    timer = setTimeout(() => { isIdle.value = true }, timeout)
  }

  const events = ['mousemove', 'keydown', 'scroll', 'touchstart']

  onMounted(() => {
    events.forEach(e => window.addEventListener(e, reset))
    reset()
  })

  onUnmounted(() => {
    events.forEach(e => window.removeEventListener(e, reset))
    clearTimeout(timer)
  })

  return [isIdle, { reset }]
}
