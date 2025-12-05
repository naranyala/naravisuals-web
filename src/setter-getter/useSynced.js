// ~/composables/useSynced.js
import { ref, watch } from 'vue'

const cache = new Map()   // global module cache

export function useSynced(key, defaultValue) {
  if (!cache.has(key)) cache.set(key, ref(defaultValue))

  const raw = cache.get(key)
  const value = ref(raw.value)

  watch(value, v => { raw.value = v })
  watch(raw, v => { value.value = v })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
