
// useScrollPercent.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollPercent() {
  const percent = ref(0)

  function get() {
    return percent.value
  }

  function set(v) {
    percent.value = Math.max(0, Math.min(100, v))
  }

  function update() {
    const doc = document.documentElement
    const max = doc.scrollHeight - doc.clientHeight
    const scrolled = (window.scrollY / max) * 100
    set(scrolled || 0)
  }

  onMounted(() => {
    window.addEventListener('scroll', update)
    update()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', update)
  })

  return { get, set, percent }
}
