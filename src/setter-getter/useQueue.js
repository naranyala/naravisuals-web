// useQueue.js
import { ref } from 'vue'

export function useQueue(initialQueue = []) {
  const queue = ref([...initialQueue])

  const get = () => [...queue.value]
  const getFront = () => queue.value[0]
  const getBack = () => queue.value[queue.value.length - 1]

  const enqueue = (item) => {
    queue.value.push(item)
  }

  const dequeue = () => {
    if (queue.value.length === 0) return null
    return queue.value.shift()
  }

  const peek = () => {
    if (queue.value.length === 0) return null
    return queue.value[0]
  }

  const clear = () => {
    queue.value = []
  }

  const isEmpty = () => queue.value.length === 0
  const size = () => queue.value.length

  const setQueue = (newQueue) => {
    queue.value = [...newQueue]
  }

  return {
    get,
    getFront,
    getBack,
    enqueue,
    dequeue,
    peek,
    clear,
    isEmpty,
    size,
    setQueue,
    queue
  }
}
