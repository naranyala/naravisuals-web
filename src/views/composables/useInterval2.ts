// composables/useInterval.ts
import { onMounted, onUnmounted } from 'vue'

export function useInterval(callback: () => void, delay: number) {
  let intervalId: number | null = null

  onMounted(() => {
    intervalId = window.setInterval(callback, delay)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
}

