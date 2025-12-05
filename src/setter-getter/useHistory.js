
// useHistory.js
import { ref } from 'vue'

export function useHistory(initial = null) {
  const past = ref([])
  const present = ref(initial)
  const future = ref([])

  function get() {
    return present.value
  }

  function set(v) {
    past.value.push(present.value)
    present.value = v
    future.value = []
  }

  function undo() {
    if (!past.value.length) return
    future.value.push(present.value)
    present.value = past.value.pop()
  }

  function redo() {
    if (!future.value.length) return
    past.value.push(present.value)
    present.value = future.value.pop()
  }

  return { get, set, undo, redo, present, past, future }
}
