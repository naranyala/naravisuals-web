// ~/composables/usePrefs.js
import { ref, watch } from 'vue'

const store = new Map()   // global in-module cache

export function usePrefs(key, defaultValue) {
  if (!store.has(key)) store.set(key, ref(defaultValue))

  const raw = store.get(key)

  const value = ref(raw.value)
  watch(value, v => { raw.value = v })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
