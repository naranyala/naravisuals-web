// composables/useMediaQuery.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)
  let mql

  const update = (e) => { matches.value = e.matches }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => mql?.removeEventListener('change', update))

  return matches
}
