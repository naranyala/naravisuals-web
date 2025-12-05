// ~/composables/useClamped.js
import { ref, computed } from 'vue'

export function useClamped(initial, { min = -Infinity, max = Infinity } = {}) {
  const raw = ref(initial)

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = Math.max(min, Math.min(max, Number(v) || min)) }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
