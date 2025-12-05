
// useQueryParam.js
import { ref, onMounted } from 'vue'

export function useQueryParam(key) {
  const value = ref('')

  function get() {
    return value.value
  }

  function set(v) {
    value.value = v
    const url = new URL(window.location.href)
    url.searchParams.set(key, v)
    window.history.replaceState({}, '', url)
  }

  onMounted(() => {
    const url = new URL(window.location.href)
    value.value = url.searchParams.get(key) || ''
  })

  return { get, set, value }
}
