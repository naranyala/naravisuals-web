
// composables/useKeyPress.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyPress(targetKey: string) {
  const pressed = ref(false)

  const downHandler = (e: KeyboardEvent) => {
    if (e.key === targetKey) pressed.value = true
  }
  const upHandler = (e: KeyboardEvent) => {
    if (e.key === targetKey) pressed.value = false
  }

  onMounted(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', downHandler)
    window.removeEventListener('keyup', upHandler)
  })

  return { pressed }
}
