// composables/useIntersectionObserver.js
import { ref } from 'vue'

export function useIntersectionObserver(options = {}) {
  const isVisible = ref(false)
  let observer = null

  const observe = (el) => {
    observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting
    }, options)
    observer.observe(el)
  }

  const unobserve = (el) => observer?.unobserve(el)

  return [isVisible, { observe, unobserve }]
}
