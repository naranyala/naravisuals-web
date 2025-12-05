// useClipboard.js
import { ref } from 'vue'

export function useClipboard() {
  const history = ref([])
  const current = ref('')
  const error = ref('')

  const get = () => current.value
  const getHistory = () => [...history.value]
  const getError = () => error.value

  const write = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      current.value = text
      history.value.push({
        text,
        timestamp: new Date(),
        type: 'written'
      })

      // Keep only last 10 items
      if (history.value.length > 10) {
        history.value.shift()
      }

      error.value = ''
      return true
    } catch (err) {
      error.value = err.message
      console.error('Failed to write to clipboard:', err)
      return false
    }
  }

  const read = async () => {
    try {
      const text = await navigator.clipboard.readText()
      current.value = text
      history.value.push({
        text,
        timestamp: new Date(),
        type: 'read'
      })

      if (history.value.length > 10) {
        history.value.shift()
      }

      error.value = ''
      return text
    } catch (err) {
      error.value = err.message
      console.error('Failed to read from clipboard:', err)
      return null
    }
  }

  const writeItems = async (items) => {
    try {
      const clipboardItems = items.map(item =>
        new ClipboardItem({ [item.type]: item.data })
      )
      await navigator.clipboard.write(clipboardItems)

      history.value.push({
        text: `[${items.length} items]`,
        timestamp: new Date(),
        type: 'written'
      })

      error.value = ''
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  const readItems = async () => {
    try {
      const items = await navigator.clipboard.read()
      const results = []

      for (const item of items) {
        for (const type of item.types) {
          const blob = await item.getType(type)
          results.push({ type, blob })
        }
      }

      history.value.push({
        text: `[${results.length} items]`,
        timestamp: new Date(),
        type: 'read'
      })

      return results
    } catch (err) {
      error.value = err.message
      return []
    }
  }

  const clearHistory = () => {
    history.value = []
  }

  const clearError = () => {
    error.value = ''
  }

  const isSupported = () => 'clipboard' in navigator

  return {
    get,
    getHistory,
    getError,
    write,
    read,
    writeItems,
    readItems,
    clearHistory,
    clearError,
    isSupported,
    current,
    history,
    error
  }
}
