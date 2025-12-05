
// useFocus.js
import { ref, onMounted } from 'vue'

export function useFocus() {
  const el = ref(null)
  const isFocused = ref(false)

  function get() {
    return isFocused.value
  }

  function set(v) {
    isFocused.value = !!v
    if (v && el.value) el.value.focus()
    if (!v && el.value) el.value.blur()
  }

  return { get, set, el, isFocused }
}
