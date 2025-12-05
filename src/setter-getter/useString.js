
// useString.js
import { ref } from 'vue'

export function useString(initial = '') {
  const value = ref(initial)

  function get() {
    return value.value
  }

  function set(v) {
    value.value = String(v)
  }

  function append(str) {
    value.value += str
  }

  function clear() {
    value.value = ''
  }

  return { get, set, append, clear, value }
}
