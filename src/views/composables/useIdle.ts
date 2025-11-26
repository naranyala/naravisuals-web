import {ref, onMounted, onUnmounted} from "vue"

export function useIdle(timeout = 30000) {
  const idle = ref(false)
  let timer

  function reset() {
    idle.value = false
    clearTimeout(timer)
    timer = setTimeout(() => idle.value = true, timeout)
  }

  onMounted(() => {
    ["mousemove","keydown","mousedown","touchstart"].forEach(ev =>
      window.addEventListener(ev, reset)
    )
    reset()
  })

  onUnmounted(() => clearTimeout(timer))

  return idle
}

