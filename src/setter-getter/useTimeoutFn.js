// composables/useTimeoutFn.js
import { ref } from 'vue'

export function useTimeoutFn(fn, delay = 0) {
  let timer = null
  const ready = ref(false)

  const run = () => {
    clear()
    timer = setTimeout(() => {
      fn()
      ready.value = true
    }, delay)
  }

  const clear = () => {
    if (timer) clearTimeout(timer)
    timer = null
    ready.value = false
  }

  return [ready, { run, clear }]
}
