// useSession.js
import { ref, watch } from 'vue'

export function useSession(key, initialValue, expiryMinutes = 60) {
  const loadFromStorage = () => {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return initialValue

      const { value, expiry } = JSON.parse(item)

      if (expiry && Date.now() > expiry) {
        sessionStorage.removeItem(key)
        return initialValue
      }

      return value
    } catch {
      return initialValue
    }
  }

  const state = ref(loadFromStorage())

  const get = () => state.value

  const set = (value) => {
    state.value = value
  }

  const setWithExpiry = (value, minutes = expiryMinutes) => {
    const expiry = Date.now() + (minutes * 60 * 1000)
    state.value = value
  }

  const remove = () => {
    state.value = initialValue
    sessionStorage.removeItem(key)
  }

  const isExpired = () => {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return true

      const { expiry } = JSON.parse(item)
      return expiry && Date.now() > expiry
    } catch {
      return true
    }
  }

  // Auto-save to sessionStorage
  watch(state, (value) => {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000)
    sessionStorage.setItem(key, JSON.stringify({ value, expiry }))
  }, { deep: true })

  return {
    get,
    set,
    setWithExpiry,
    remove,
    isExpired,
    state
  }
}
