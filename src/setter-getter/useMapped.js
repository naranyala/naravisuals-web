// ~/composables/useMapped.js
import { ref, computed } from 'vue'

export function useMapped(initial, { get: toOut, set: toIn }) {
  const raw = ref(initial)

  const value = computed({
    get() { return toOut ? toOut(raw.value) : raw.value },
    set(v) { raw.value = toIn ? toIn(v) : v }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set }
}
