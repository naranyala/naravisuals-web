// useMap.js
import { ref } from 'vue'

export function useMap(initialMap = {}) {
  const map = ref(new Map(Object.entries(initialMap)))

  const get = (key) => map.value.get(key)
  const getAll = () => Object.fromEntries(map.value.entries())
  const getKeys = () => Array.from(map.value.keys())
  const getValues = () => Array.from(map.value.values())
  const getEntries = () => Array.from(map.value.entries())

  const set = (key, value) => {
    const newMap = new Map(map.value)
    newMap.set(key, value)
    map.value = newMap
  }

  const setAll = (newMap) => {
    map.value = new Map(Object.entries(newMap))
  }

  const remove = (key) => {
    if (map.value.has(key)) {
      const newMap = new Map(map.value)
      newMap.delete(key)
      map.value = newMap
    }
  }

  const has = (key) => map.value.has(key)
  const clear = () => { map.value = new Map() }
  const size = () => map.value.size

  return {
    get,
    getAll,
    getKeys,
    getValues,
    getEntries,
    set,
    setAll,
    remove,
    has,
    clear,
    size,
    map
  }
}
