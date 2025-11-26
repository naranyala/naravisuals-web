// composables/useWindowScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowScroll() {
  const x = ref(window.scrollX)
  const y = ref(window.scrollY)

  const update = () => {
    x.value = window.scrollX
    y.value = window.scrollY
  }

  const scrollTo = (options: ScrollToOptions) => window.scrollTo(options)

  onMounted(() => window.addEventListener('scroll', update))
  onUnmounted(() => window.removeEventListener('scroll', update))

  return {
    x: readonly(x),
    y: readonly(y),
    scrollTo,
    scrollToTop: () => scrollTo({ top: 0, behavior: 'smooth' }),
  }
}
