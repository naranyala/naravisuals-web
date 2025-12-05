// ~/composables/useStack.js
import { ref, computed } from 'vue'

export function useStack(initial = []) {
  const raw = ref([...initial])

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = Array.isArray(v) ? [...v] : [] }
  })

  const push = item => raw.value.push(item)
  const pop = () => raw.value.pop()
  const top = computed(() => raw.value.at(-1))
  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, top, get, set, push, pop }
}
