
// useList.js
import { ref } from 'vue'

export function useList(initial = []) {
  const list = ref([...initial])

  function get() {
    return list.value
  }

  function set(arr) {
    list.value = [...arr]
  }

  function push(item) {
    list.value.push(item)
  }

  function removeByIndex(i) {
    list.value.splice(i, 1)
  }

  return { get, set, push, removeByIndex, list }
}
