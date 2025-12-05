// composables/useTitle.js
import { ref, watch } from 'vue'

export function useTitle(initial = '') {
  const title = ref(initial)

  watch(title, (t) => {
    document.title = t
  }, { immediate: true })

  const setTitle = (newTitle) => { title.value = newTitle }

  return [title, setTitle]
}
