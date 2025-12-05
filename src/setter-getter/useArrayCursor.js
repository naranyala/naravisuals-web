
// useArrayCursor.js
import { ref } from 'vue'

export function useArrayCursor(list = []) {
  const index = ref(0)
  const items = ref(list)

  function get() {
    return items.value[index.value]
  }

  function set(i) {
    index.value = Math.max(0, Math.min(items.value.length - 1, i))
  }

  function next() {
    set(index.value + 1)
  }

  function prev() {
    set(index.value - 1)
  }

  function reset() {
    index.value = 0
  }

  return { get, set, next, prev, reset, index, items }
}
