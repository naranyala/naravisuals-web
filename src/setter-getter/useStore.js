// useStore.js
import { reactive, toRefs, watch } from 'vue'

export function useStore(initialState) {
  const state = reactive({ ...initialState })
  const history = []
  const MAX_HISTORY = 50

  const get = (key) => {
    return key ? state[key] : { ...state }
  }

  const getAll = () => ({ ...state })
  const getHistory = () => [...history]

  const set = (key, value) => {
    if (typeof key === 'object') {
      // Batch update
      Object.keys(key).forEach(k => {
        state[k] = key[k]
      })
    } else {
      state[key] = value
    }
    takeSnapshot()
  }

  const reset = () => {
    Object.keys(initialState).forEach(key => {
      state[key] = initialState[key]
    })
    takeSnapshot()
  }

  const takeSnapshot = () => {
    history.push(JSON.parse(JSON.stringify(state)))
    if (history.length > MAX_HISTORY) {
      history.shift()
    }
  }

  const undo = () => {
    if (history.length > 1) {
      history.pop() // Remove current state
      const previous = history[history.length - 1]
      Object.keys(previous).forEach(key => {
        state[key] = previous[key]
      })
    }
  }

  const subscribe = (key, callback) => {
    watch(() => state[key], callback, { deep: true })
  }

  const createAction = (actionFn) => {
    return (...args) => {
      const result = actionFn(state, ...args)
      takeSnapshot()
      return result
    }
  }

  takeSnapshot() // Initial snapshot

  return {
    get,
    getAll,
    getHistory,
    set,
    reset,
    undo,
    subscribe,
    createAction,
    ...toRefs(state)
  }
}
