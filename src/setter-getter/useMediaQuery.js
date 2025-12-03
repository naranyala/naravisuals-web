// useMediaQuery.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query) {
  const mediaQuery = window.matchMedia(query)
  const matches = ref(mediaQuery.matches)

  const get = () => matches.value

  const update = (event) => {
    matches.value = event.matches
  }

  const setQuery = (newQuery) => {
    mediaQuery.removeEventListener('change', update)
    const newMediaQuery = window.matchMedia(newQuery)
    matches.value = newMediaQuery.matches
    newMediaQuery.addEventListener('change', update)
    return newMediaQuery
  }

  onMounted(() => {
    mediaQuery.addEventListener('change', update)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', update)
  })

  return {
    get,
    setQuery,
    matches
  }
}
