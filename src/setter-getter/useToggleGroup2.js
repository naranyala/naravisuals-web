// ~/composables/useToggleGroup.js
import { ref, computed } from 'vue'

export function useToggleGroup(keys, initialKey) {
  const map = ref(Object.fromEntries(keys.map(k => [k, k === initialKey])))

  const value = computed({
    get() { return map.value },
    set(k) {
      if (!map.value.hasOwnProperty(k)) return
      Object.keys(map.value).forEach(key => {
        map.value[key] = key === k
      })
    }
  })

  const is = k => map.value[k] || false
  const get = () => value.value
  const set = (k) => { value.value = k }

  return { raw: map, value, get, set, is }
}
