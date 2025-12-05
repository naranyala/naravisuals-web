// composables/useClipboardText.js
import { ref } from 'vue'

export function useClipboardText() {
  const text = ref('')
  const supported = ref('clipboard' in navigator)

  const write = async (value) => {
    if (!supported.value) return false
    try {
      await navigator.clipboard.writeText(value)
      text.value = value
      return true
    } catch {
      return false
    }
  }

  const read = async () => {
    if (!supported.value) return ''
    try {
      const content = await navigator.clipboard.readText()
      text.value = content
      return content
    } catch {
      return ''
    }
  }

  return [
    { text, supported },
    { write, read }
  ]
}
