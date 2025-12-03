// useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  // Try to get initial value from localStorage
  const storedValue = localStorage.getItem(key)
  const initial = storedValue ? JSON.parse(storedValue) : initialValue

  const state = ref(initial)

  const get = () => state.value

  const set = (newValue) => {
    state.value = newValue
  }

  const remove = () => {
    state.value = initialValue
    localStorage.removeItem(key)
  }

  // Watch state and persist to localStorage
  watch(state, (value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, { deep: true })

  return {
    get,
    set,
    remove,
    state
  }
}
