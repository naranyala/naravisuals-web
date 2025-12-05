// composables/useClickOutside.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useClickOutside() {
  const isOutside = ref(false)

  const handler = (e) => {
    isOutside.value = true
    setTimeout(() => isOutside.value = false, 0)
  }

  const bind = (el) => {
    el.__click_outside__?.()
    el.__click_outside__ = () => document.addEventListener('click', handler)
    document.addEventListener('click', handler)
  }

  const unbind = (el) => {
    if (el?.__click_outside__) {
      document.removeEventListener('click', handler)
      el.__click_outside__ = null
    }
  }

  onUnmounted(() => document.removeEventListener('click', handler))

  return [isOutside, { bind, unbind }]
}
