// composables/usePreferredDark.js
import { ref, watch } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export function usePreferredDark() {
  const [override, setOverride] = useLocalStorage('dark-mode-override', null)
  const prefersDark = ref(false)

  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const update = () => { prefersDark.value = mql.matches }

  mql.addEventListener('change', update)
  update()

  const isDark = ref(
    override !== null ? override === 'dark' : prefersDark.value
  )

  watch([override, prefersDark], () => {
    isDark.value = override !== null ? override === 'dark' : prefersDark.value
  })

  const setDark = (value) => setOverride(value ? 'dark' : 'light')
  const clearOverride = () => setOverride(null)

  return [
    isDark,
    { setDark, clearOverride, prefersDark, hasOverride: override !== null }
  ]
}
