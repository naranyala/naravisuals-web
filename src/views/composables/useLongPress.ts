import { onMounted, onUnmounted } from "vue"

export function useLongPress(target, callback, delay = 500) {
  let timer

  const start = () => {
    timer = setTimeout(callback, delay)
  }

  const cancel = () => clearTimeout(timer)

  onMounted(() => {
    target.value?.addEventListener("mousedown", start)
    target.value?.addEventListener("mouseup", cancel)
    target.value?.addEventListener("mouseleave", cancel)
    target.value?.addEventListener("touchstart", start)
    target.value?.addEventListener("touchend", cancel)
  })

  onUnmounted(cancel)
}

