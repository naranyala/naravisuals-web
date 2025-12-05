// ~/composables/useCapitalized.js
import { ref, computed } from 'vue'

export function useCapitalized(initial = '') {
  const raw = ref(initial)

  const value = computed({
    get() { return raw.value },
    set(v) {
      raw.value = (v || '')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
    }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
