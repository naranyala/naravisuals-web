// useCache.js
import { ref } from 'vue'

export function useCache(defaultTTL = 300000) { // 5 minutes default
  const cache = ref(new Map())

  const get = (key) => {
    const entry = cache.value.get(key)
    if (!entry) return null

    // Check if expired
    if (entry.expiry && Date.now() > entry.expiry) {
      cache.value.delete(key)
      return null
    }

    return entry.value
  }

  const set = (key, value, ttl = defaultTTL) => {
    const expiry = ttl ? Date.now() + ttl : null
    cache.value.set(key, { value, expiry })
  }

  const remove = (key) => {
    cache.value.delete(key)
  }

  const clear = () => {
    cache.value.clear()
  }

  const has = (key) => {
    const entry = cache.value.get(key)
    if (!entry) return false

    if (entry.expiry && Date.now() > entry.expiry) {
      cache.value.delete(key)
      return false
    }

    return true
  }

  const getKeys = () => Array.from(cache.value.keys())
  const getValues = () => Array.from(cache.value.values()).map(entry => entry.value)
  const getSize = () => cache.value.size

  const memoize = (fn, ttl = defaultTTL) => {
    return async (...args) => {
      const key = JSON.stringify(args)

      if (has(key)) {
        return get(key)
      }

      const result = await fn(...args)
      set(key, result, ttl)
      return result
    }
  }

  return {
    get,
    set,
    remove,
    clear,
    has,
    getKeys,
    getValues,
    getSize,
    memoize,
    cache
  }
}
