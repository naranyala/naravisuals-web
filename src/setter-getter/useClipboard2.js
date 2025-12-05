// composables/useClipboard.js
import { ref } from 'vue'

export function useClipboard() {
  const text = ref('')
  const isSupported = ref('clipboard' in navigator)
  const copied = ref(false)

  const copy = async (value) => {
    if (!isSupported.value) return false
    try {
      await navigator.clipboard.writeText(value)
      text.value = value
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
      return true
    } catch (err) {
      copied.value = false
      return false
    }
  }

  return [
    { text, copied, isSupported },
    { copy }
  ]
}
