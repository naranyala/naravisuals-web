// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  const startTracking = () => {
    window.addEventListener('mousemove', update)
  }

  const stopTracking = () => {
    window.removeEventListener('mousemove', update)
  }

  onMounted(startTracking)
  onUnmounted(stopTracking)

  return [
    { x, y },        // getter
    { startTracking, stopTracking }
  ]
}
