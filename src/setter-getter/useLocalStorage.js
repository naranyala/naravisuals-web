// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  // Try to load from localStorage
  const stored = localStorage.getItem(key)
  const initial = stored !== null ? JSON.parse(stored) : initialValue

  const data = ref(initial)

  // Save to localStorage whenever it changes
  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  // Explicit setter (optional, but useful for clarity)
  const setValue = (newValue) => {
    data.value = newValue
  }

  // Getter is just .value, but we expose it as `value` for consistency
  return {
    value: data,     // ref acts as getter/setter
    setValue        // explicit setter (optional)
  }
}
