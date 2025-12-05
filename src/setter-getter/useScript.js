// composables/useScript.js
import { ref } from 'vue'

export function useScript(src) {
  const loaded = ref(false)
  const error = ref(false)

  const load = () => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        loaded.value = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.onload = () => { loaded.value = true; resolve() }
      script.onerror = () => { error.value = true; reject() }
      document.head.appendChild(script)
    })
  }

  return [loaded, { load, error }]
}
