// ~/composables/useFileList.js
import { ref, computed } from 'vue'

export function useFileList(initial = []) {
  const raw = ref([...initial]) // File[]

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = Array.isArray(v) ? v.filter(i => i instanceof File) : [] }
  })

  const add = (...files) => raw.value.push(...files.filter(f => f instanceof File))
  const clear = () => { raw.value = [] }
  const get = () => value.value
  const set = (v) => { value.value = v }

  return { raw, value, get, set, add, clear }
}
