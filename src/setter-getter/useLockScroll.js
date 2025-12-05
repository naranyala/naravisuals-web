// composables/useLockScroll.js
import { ref } from 'vue'

export function useLockScroll() {
  const locked = ref(false)
  const originalOverflow = document.body.style.overflow

  const lock = () => {
    if (locked.value) return
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    locked.value = true
  }

  const unlock = () => {
    if (!locked.value) return
    document.body.style.overflow = originalOverflow
    locked.value = false
  }

  const toggle = () => locked.value ? unlock() : lock()

  return [locked, { lock, unlock, toggle }]
}
