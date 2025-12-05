// ~/composables/useValidated.js
import { ref, computed } from 'vue'

export function useValidated(initial, rule) {
  const raw = ref(initial)
  const error = ref('')

  const value = computed({
    get() { return raw.value },
    set(v) {
      const msg = rule(v)
      if (msg) { error.value = msg; return }
      error.value = ''
      raw.value = v
    }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set, error }
}
