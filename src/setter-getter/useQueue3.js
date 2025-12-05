
// useQueue.js
import { ref } from 'vue'

export function useQueue(initial = []) {
  const q = ref([...initial])

  function get() {
    return q.value
  }

  function set(v) {
    q.value = [...v]
  }

  function enqueue(item) {
    q.value.push(item)
  }

  function dequeue() {
    return q.value.shift()
  }

  function peek() {
    return q.value[0]
  }

  return { get, set, enqueue, dequeue, peek, q }
}
