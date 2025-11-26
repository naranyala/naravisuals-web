// composables/useFavicon.ts
export function useFavicon(href?: string) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'

  if (!document.querySelector("link[rel*='icon']")) {
    document.head.appendChild(link)
  }

  if (href) link.href = href

  return (newHref: string) => (link.href = newHref)
}

// Usage
// const setFavicon = useFavicon()
// setFavicon('/favicon-unread.png') // when new message
