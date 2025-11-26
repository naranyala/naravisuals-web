// composables/useMediaQuery.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(false)

  const update = (e: MediaQueryListEvent) => (matches.value = e.matches)

  onMounted(() => {
    const mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', update)
    onUnmounted(() => mql.removeEventListener('change', update))
  })

  return readonly(matches)
}

// Usage
// const isDark = useMediaQuery('(prefers-color-scheme: dark)')
// const isMobile = useMediaQuery('(max-width: 767px)')
// const hasHover = useMediaQuery('(hover: hover)')
