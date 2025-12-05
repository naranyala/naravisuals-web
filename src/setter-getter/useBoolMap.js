
// useBoolMap.js
import { reactive } from 'vue'

export function useBoolMap(initial = {}) {
  const state = reactive({ ...initial })

  function get(key) {
    return state[key]
  }

  function set(key, v) {
    state[key] = !!v
  }

  function toggle(key) {
    state[key] = !state[key]
  }

  return { get, set, toggle, state }
}
