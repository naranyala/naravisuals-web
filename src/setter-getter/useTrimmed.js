// ~/composables/useTrimmed.js
import { ref, computed } from 'vue'

export function useTrimmed(initial = '') {
  const raw = ref(initial)

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = (v || '').trim() }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
