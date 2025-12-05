// ~/composables/useQueue.js
import { ref, computed } from 'vue'

export function useQueue(initial = []) {
  const raw = ref([...initial])

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = Array.isArray(v) ? [...v] : [] }
  })

  const enqueue = item => raw.value.push(item)
  const dequeue = () => raw.value.shift()
  const clear = () => { raw.value = [] }
  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set, enqueue, dequeue, clear }
}
