// composables/useFullscreen.js
import { ref, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  const update = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  document.addEventListener('fullscreenchange', update)

  const enter = (el = document.documentElement) => el.requestFullscreen()
  const exit = () => document.exitFullscreen()
  const toggle = () => isFullscreen.value ? exit() : enter()

  onUnmounted(() => document.removeEventListener('fullscreenchange', update))

  return [isFullscreen, { enter, exit, toggle }]
}
