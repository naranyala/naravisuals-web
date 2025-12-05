
// useOnline.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useOnline() {
  const online = ref(navigator.onLine)

  function get() { return online.value }
  function set(v) { online.value = !!v }

  function update() { set(navigator.onLine) }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { get, set, online }
}
