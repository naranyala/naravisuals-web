// composables/useVibrate.js
import { ref } from 'vue'

export function useVibrate() {
  const canVibrate = ref('vibrate' in navigator)

  const vibrate = (pattern = [200]) => {
    if (canVibrate.value) navigator.vibrate(pattern)
  }

  const stop = () => navigator.vibrate(0)

  return [canVibrate, { vibrate, stop }]
}
