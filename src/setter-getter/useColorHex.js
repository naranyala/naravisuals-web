// ~/composables/useColorHex.js
import { ref, computed } from 'vue'

export function useColorHex(initial = '#000000') {
  const raw = ref(initial)

  const value = computed({
    get() { return raw.value },
    set(v) {
      const s = String(v).trim()
      if (/^#([0-9a-f]{3}){1,2}$/i.test(s)) raw.value = s
    }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
