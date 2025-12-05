// composables/useFavicon.js
import { ref } from 'vue'

export function useFavicon(initial = null) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.rel = 'icon'
  document.head.appendChild(link)

  const favicon = ref(initial)

  const setFavicon = (url) => {
    favicon.value = url
    link.href = url
  }

  if (initial) setFavicon(initial)

  return [favicon, setFavicon]
}
