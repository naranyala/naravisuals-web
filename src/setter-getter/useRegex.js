// ~/composables/useRegex.js
import { ref, computed } from 'vue'

export function useRegex(initial, regex = /^\d*$/) {
  const raw = ref(initial)

  const value = computed({
    get() { return raw.value },
    set(v) { if (regex.test(v)) raw.value = v }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
