// composables/useClipboard.ts
import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
      return true
    } catch {
      // Fallback for HTTP or old browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
      return true
    }
  }

  return { copy, copied: readonly(copied) }
}
