// ~/composables/useCycle.js
import { ref, computed, watch } from 'vue'

export function useCycle(list, startAt = 0) {
  const raw = ref(startAt)               // current index
  const arr = ref(list)                  // allow list changes

  const value = computed({
    get() { return arr.value[raw.value] },
    set(v) {
      const idx = arr.value.indexOf(v)
      if (idx > -1) raw.value = idx
    }
  })

  const next = () => { raw.value = (raw.value + 1) % arr.value.length }
  const prev = () => {
    raw.value = (raw.value - 1 + arr.value.length) % arr.value.length
  }
  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set, next, prev }
}
