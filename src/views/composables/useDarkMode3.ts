// composables/useDarkMode.ts
import { ref, onMounted } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode() {
  const isDark = useLocalStorage('darkMode', false)

  const setDark = (value: boolean) => {
    isDark.value = value
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggle = () => setDark(!isDark.value)

  onMounted(() => {
    // If user hasn't chosen, follow system preference
    if (isDark.value === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDark(prefersDark)
    } else {
      setDark(isDark.value)
    }

    // Listen to system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (isDark.value === null) setDark(e.matches)
    })
  })

  return { isDark: readonly(isDark), toggle, setDark }
}
