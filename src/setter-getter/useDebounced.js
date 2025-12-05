// ~/composables/useDebounced.js
import { ref, watch, computed } from 'vue'

export function useDebounced(ms = 300) {
  const live = ref('')      // what the user types
  const shadow = ref('')     // debounced copy

  let timer
  watch(live, v => {
    clearTimeout(timer)
    timer = setTimeout(() => { shadow.value = v }, ms)
  })

  const value = computed({
    get() { return shadow.value },
    set(v) { live.value = shadow.value = v }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw: live, value, get, set }
}
