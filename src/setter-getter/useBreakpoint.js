
// useBreakpoint.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const bp = ref('')

  function compute() {
    const w = window.innerWidth
    if (w < 640) bp.value = 'sm'
    else if (w < 1024) bp.value = 'md'
    else bp.value = 'lg'
  }

  function get() {
    return bp.value
  }

  function set(v) {
    bp.value = v
  }

  onMounted(() => {
    compute()
    window.addEventListener('resize', compute)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', compute)
  })

  return { get, set, bp }
}
