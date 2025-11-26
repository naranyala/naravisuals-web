// composables/useLocalStorage.ts
import { ref, watchEffect, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): Ref<T> {
  const read = (): T => {
    if (typeof window === 'undefined') return initialValue

    const item = localStorage.getItem(key)
    if (item === null) return initialValue

    try {
      return JSON.parse(item) as T
    } catch {
      return initialValue
    }
  }

  const state = ref<T>(read()) as Ref<T>

  watchEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(state.value))
  })

  return state
}
