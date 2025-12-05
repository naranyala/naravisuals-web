
// useClipboard.js
import { ref } from 'vue'

export function useClipboard() {
  const text = ref('')

  function get() {
    return text.value
  }

  async function set(v) {
    text.value = v
    await navigator.clipboard.writeText(v)
  }

  async function read() {
    const v = await navigator.clipboard.readText()
    text.value = v
    return v
  }

  return { get, set, read, text }
}
