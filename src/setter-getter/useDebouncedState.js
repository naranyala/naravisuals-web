// useDebouncedState.js
import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'

export function useDebouncedState(initialValue, delay = 300) {
  const state = ref(initialValue)
  const debouncedState = ref(initialValue)

  let debounceTimer

  const get = () => state.value
  const getDebounced = () => debouncedState.value

  const set = (newValue) => {
    state.value = newValue

    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedState.value = newValue
    }, delay)
  }

  const cancel = () => {
    clearTimeout(debounceTimer)
  }

  const flush = () => {
    clearTimeout(debounceTimer)
    debouncedState.value = state.value
  }

  return {
    get,
    getDebounced,
    set,
    cancel,
    flush,
    state,
    debouncedState
  }
}
