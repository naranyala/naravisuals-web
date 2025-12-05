// composables/useLocalRef.js
import { ref, watch } from 'vue'

export function useLocalRef(key, initial) {
  const stored = localStorage.getItem(key)
  const value = ref(stored !== null ? JSON.parse(stored) : initial)

  watch(value, (v) => {
    localStorage.setItem(key, JSON.stringify(v))
  }, { deep: true })

  const set = (v) => { value.value = v }

  return [value, set]
}
