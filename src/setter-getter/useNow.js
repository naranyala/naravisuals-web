// composables/useNow.js
import { ref } from 'vue'
import { useInterval } from './useInterval'

export function useNow({ format = 'HH:mm:ss' } = {}) {
  const now = ref(new Date())

  const [, { start }] = useInterval(() => {
    now.value = new Date()
  }, 1000)

  start()

  const formatted = ref('')
  watch(now, () => {
    formatted.value = now.value.toLocaleTimeString()
  }, { immediate: true })

  return [now, { formatted }]
}
