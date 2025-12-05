// composables/useHotkey.js
import { onMounted, onUnmounted } from 'vue'

export function useHotkey(keys, callback) {
  const handler = (e) => {
    const combo = keys.split('+').map(k => k.toLowerCase())
    const mods = combo.slice(0, -1)
    const key = combo[combo.length - 1]

    if (mods.includes('ctrl') !== e.ctrlKey) return
    if (mods.includes('shift') !== e.shiftKey) return
    if (mods.includes('alt') !== e.altKey) return
    if (mods.includes('meta') !== e.metaKey) return
    if (e.key.toLowerCase() === key) {
      e.preventDefault()
      callback(e)
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
