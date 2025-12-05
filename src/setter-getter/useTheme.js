// useTheme.js
import { ref, watch, onMounted } from 'vue'

export function useTheme(initialTheme = 'light') {
  const theme = ref(initialTheme)
  const themes = ref({
    light: {
      '--bg-color': '#ffffff',
      '--text-color': '#333333',
      '--primary-color': '#007bff',
      '--secondary-color': '#6c757d'
    },
    dark: {
      '--bg-color': '#1a1a1a',
      '--text-color': '#f8f9fa',
      '--primary-color': '#0d6efd',
      '--secondary-color': '#6c757d'
    },
    blue: {
      '--bg-color': '#e3f2fd',
      '--text-color': '#0d47a1',
      '--primary-color': '#1976d2',
      '--secondary-color': '#64b5f6'
    }
  })

  const get = () => theme.value
  const getThemes = () => ({ ...themes.value })
  const getThemeVars = () => ({ ...themes.value[theme.value] })

  const set = (themeName) => {
    if (themes.value[themeName]) {
      theme.value = themeName
      return true
    }
    return false
  }

  const addTheme = (name, variables) => {
    themes.value[name] = { ...variables }
  }

  const updateTheme = (name, variables) => {
    if (themes.value[name]) {
      themes.value[name] = { ...themes.value[name], ...variables }

      // Update current theme if it's the one being updated
      if (theme.value === name) {
        applyTheme(name)
      }
    }
  }

  const removeTheme = (name) => {
    if (name !== 'light' && name !== 'dark' && themes.value[name]) {
      delete themes.value[name]

      // Fallback to light theme if current theme is removed
      if (theme.value === name) {
        theme.value = 'light'
      }
    }
  }

  const applyTheme = (themeName = theme.value) => {
    const themeVars = themes.value[themeName]
    if (!themeVars) return

    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })

    // Store in localStorage
    localStorage.setItem('app-theme', themeName)
  }

  const toggle = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    set(newTheme)
  }

  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme && themes.value[savedTheme]) {
      theme.value = savedTheme
      applyTheme(savedTheme)
    }
  }

  // Watch for theme changes and apply them
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  onMounted(() => {
    loadSavedTheme()
    applyTheme()
  })

  return {
    get,
    getThemes,
    getThemeVars,
    set,
    addTheme,
    updateTheme,
    removeTheme,
    toggle,
    applyTheme,
    theme,
    themes
  }
}
