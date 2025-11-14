// composables/useTitle.js
import { ref, watch, onUnmounted } from 'vue'

export function useTitle(title) {
  const original = document.title
  const current = ref(title)

  watch(
    current,
    (val) => {
      document.title = val || original
    },
    { immediate: true },
  )

  onUnmounted(() => {
    document.title = original
  })

  return current
}
