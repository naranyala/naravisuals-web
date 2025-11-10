const URL_STORAGE_KEY = 'key2naravisual-web'

export function saveCurrentUrl() {
  const fullUrl = window.location.href // includes ?search=vue&page=69#section

  console.log(fullUrl)

  try {
    localStorage.setItem(URL_STORAGE_KEY, fullUrl)
    console.log('URL saved:', fullUrl)
  } catch (e) {
    console.warn('localStorage quota exceeded bro', e)
  }
}

export function restoreLastUrl() {
  try {
    const saved = localStorage.getItem(URL_STORAGE_KEY)
    const current = window.location.href

    if (saved && saved !== current) {
      console.log('Restoring last URL:', saved)
      window.location.replace(saved) // replace = no new history entry
    }
  } catch (e) {
    console.warn('Failed to restore URL', e)
  }
}

export function setQueryParams(params, replace = false) {
  const url = new URL(window.location.href)

  url.search = ''
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  if (replace) {
    history.replaceState({ queryParams: params }, '', url.toString())
  } else {
    history.pushState({ queryParams: params }, '', url.toString())
  }
}

export function getQueryParams() {
  const url = new URL(window.location.href)

  const params = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}
