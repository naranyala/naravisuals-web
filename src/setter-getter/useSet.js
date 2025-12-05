
// useSet.js
import { ref } from 'vue'

export function useSet(initial = []) {
  const setRef = ref(new Set(initial))

  function get() {
    return setRef.value
  }

  function set(newSet) {
    setRef.value = new Set(newSet)
  }

  function add(item) {
    setRef.value.add(item)
    setRef.value = new Set(setRef.value)
  }

  function remove(item) {
    setRef.value.delete(item)
    setRef.value = new Set(setRef.value)
  }

  function has(item) {
    return setRef.value.has(item)
  }

  return { get, set, add, remove, has, setRef }
}
