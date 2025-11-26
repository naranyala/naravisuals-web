// composables/useDarkMode.ts
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode() {
  const isDark = useLocalStorage('darkMode', false)

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // Apply on initial load
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }

  return { isDark, toggleDarkMode }
}
