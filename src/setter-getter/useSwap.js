// composables/useSwipe.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useSwipe(el) {
  const direction = ref(null)
  const distance = ref({ x: 0, y: 0 })

  let startX, startY

  const onTouchStart = (e) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (!startX || !startY) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const diffX = startX - endX
    const diffY = startY - endY

    distance.value = { x: Math.abs(diffX), y: Math.abs(diffY) }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      direction.value = diffX > 0 ? 'left' : 'right'
    } else {
      direction.value = diffY > 0 ? 'up' : 'down'
    }

    setTimeout(() => { direction.value = null }, 100)
  }

  onMounted(() => {
    el.value.addEventListener('touchstart', onTouchStart)
    el.value.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    el.value?.removeEventListener('touchstart', onTouchStart)
    el.value?.removeEventListener('touchend', onTouchEnd)
  })

  return [direction, { distance }]
}
