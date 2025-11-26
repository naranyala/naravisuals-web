// composables/useScroll.ts
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export function useScroll() {
  const x = ref(window.scrollX)
  const y = ref(window.scrollY)

  let prevX = x.value
  let prevY = y.value

  const update = () => {
    x.value = window.scrollX
    y.value = window.scrollY
  }

  const dirX = computed(() => (x.value > prevX ? 'right' : x.value < prevX ? 'left' : null))
  const dirY = computed(() => (y.value > prevY ? 'down' : y.value < prevY ? 'up' : null))

  const updateAndTrack = () => {
    prevX = x.value
    prevY = y.value
    update()
  }

  onMounted(() => window.addEventListener('scroll', updateAndTrack, { passive: true }))
  onBeforeUnmount(() => window.removeEventListener('scroll', updateAndTrack))

  return {
    x,
    y,
    position: computed(() => ({ x: x.value, y: y.value })),
    direction: computed(() => ({ x: dirX.value, y: dirY.value }))
  }
}
