// composables/useMousePosition.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition(throttleMs = 0) {
  const x = ref(0)
  const y = ref(0)
  let timeout: number | null = null

  const update = (e: MouseEvent) => {
    if (throttleMs === 0) {
      x.value = e.clientX
      y.value = e.clientY
    } else if (!timeout) {
      timeout = window.setTimeout(() => {
        x.value = e.clientX
        y.value = e.clientY
        timeout = null
      }, throttleMs)
    }
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

