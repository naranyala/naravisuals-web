
// useObjectStore.js
import { reactive } from 'vue'

export function useObjectStore(initial = {}) {
  const state = reactive({ ...initial })

  function get() {
    return state
  }

  function set(obj) {
    for (const key in state) delete state[key]
    Object.assign(state, obj)
  }

  function patch(obj) {
    Object.assign(state, obj)
  }

  return { get, set, patch, state }
}
