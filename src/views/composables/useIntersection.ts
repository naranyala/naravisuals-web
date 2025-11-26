
import {ref, onMounted, onUnmounted} from "vue"

export function useIntersection(target, options) {
  const visible = ref(false)

  let observer

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      visible.value = entry.isIntersecting
    }, options)
    if (target.value) observer.observe(target.value)
  })

  onUnmounted(() => observer?.disconnect())

  return visible
}
