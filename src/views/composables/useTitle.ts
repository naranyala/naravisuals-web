// composables/useTitle.ts
import { ref, watch } from 'vue'

export function useTitle(title: Ref<string> | string) {
  const titleRef = ref(title)

  watch(
    titleRef,
    (newTitle) => {
      document.title = newTitle + (newTitle ? ' | MyApp' : 'MyApp')
    },
    { immediate: true }
  )

  return titleRef
  }
}

// Usage
const pageTitle = useTitle('Dashboard')
pageTitle.value = 'Settings → Profile'
