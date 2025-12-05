// composables/usePermission.js
import { ref, onMounted } from 'vue'

export function usePermission(name) {
  const state = ref('prompt') // 'granted' | 'denied' | 'prompt'

  const query = async () => {
    if (!navigator.permissions) return
    try {
      const result = await navigator.permissions.query({ name })
      state.value = result.state
      result.onchange = () => { state.value = result.state }
    } catch { }
  }

  onMounted(query)

  const request = async () => {
    if (name === 'camera') await navigator.mediaDevices.getUserMedia({ video: true })
    if (name === 'microphone') await navigator.mediaDevices.getUserMedia({ audio: true })
    if (name === 'geolocation') await navigator.geolocation.getCurrentPosition(() => { })
    await query()
  }

  return [state, { request, query }]
}
