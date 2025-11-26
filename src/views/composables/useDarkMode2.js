// composables/useDarkMode.ts
import { ref, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  watch(isDark, (val) => {
    document.documentElement.classList.toggle('dark', val)
    localStorage.setItem('theme', val ? 'dark' : 'light')
  }, { immediate: true })

  const toggle = () => (isDark.value = !isDark.value)

  return { isDark, toggle }
}

