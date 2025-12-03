// composables/useStorageSync.js
import { ref, computed } from 'vue'

export function useStorageSync(key, initialValue, options = {}) {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options

  const getStored = () => {
    const item = localStorage.getItem(key)
    if (item == null) return initialValue
    try {
      return deserializer(item)
    } catch {
      return initialValue
    }
  }

  const stored = ref(getStored())

  const value = computed({
    get: () => stored.value,
    set: (newVal) => {
      stored.value = newVal
      try {
        localStorage.setItem(key, serializer(newVal))
      } catch (e) {
        console.warn('Failed to save to localStorage', e)
      }
    }
  })

  const remove = () => {
    localStorage.removeItem(key)
    stored.value = initialValue
  }

  return { value, remove }
}


