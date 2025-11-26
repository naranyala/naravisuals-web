import {ref} from "vue"

export function useDeviceOrientation() {
  const alpha = ref(0)
  const beta = ref(0)
  const gamma = ref(0)

  function handler(e) {
    alpha.value = e.alpha
    beta.value = e.beta
    gamma.value = e.gamma
  }

  onMounted(() => window.addEventListener("deviceorientation", handler))
  onUnmounted(() => window.removeEventListener("deviceorientation", handler))

  return { alpha, beta, gamma }
}

