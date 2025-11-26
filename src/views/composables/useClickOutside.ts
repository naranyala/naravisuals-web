// composables/useClickOutside.ts
import { onMounted, onBeforeUnmount, Ref } from 'vue'

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: () => void
) {
  const handleClick = (e: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(e.target as Node)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClick)
  })
}
