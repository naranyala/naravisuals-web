// ~/composables/useStorage.js
import { ref, watch } from 'vue'

export function useStorage(key, defaultValue = null) {
  const raw = ref(
    JSON.parse(localStorage.getItem(key) ?? 'null') ?? defaultValue
  )

  const value = ref(raw.value)

  watch(value, newVal => {
    raw.value = newVal
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
