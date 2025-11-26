// composables/useIntersectionObserver.ts
import { ref, onMounted, onBeforeUnmount, Ref } from 'vue'

export function useIntersectionObserver(
  target: Ref<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const isIntersecting = ref(false)
  const entry = ref<IntersectionObserverEntry | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(([e]) => {
      isIntersecting.value = e.isIntersecting
      entry.value = e
    }, options)

    if (target.value) observer.observe(target.value)
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return { isIntersecting, entry }
}
