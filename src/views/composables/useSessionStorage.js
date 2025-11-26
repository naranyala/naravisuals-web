// composables/useSessionStorage.ts
import { ref, watch } from 'vue'

export function useSessionStorage<T>(key: string, initialValue: T) {
  const stored = sessionStorage.getItem(key)
  const value = ref<T>(stored ? JSON.parse(stored) : initialValue)

  watch(value, (newVal) => {
    sessionStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return value
}
