
// usePressHold.js
import { ref } from 'vue'

export function usePressHold(threshold = 500) {
  const holding = ref(false)
  let timer = null

  function get() {
    return holding.value
  }

  function set(v) {
    holding.value = !!v
  }

  function onDown() {
    timer = setTimeout(() => set(true), threshold)
  }

  function onUp() {
    clearTimeout(timer)
    set(false)
  }

  return { get, set, onDown, onUp, holding }
}
