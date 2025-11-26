import {onMounted, onUnmounted} from "vue"

export function useEvent(target, event, handler, options) {
  onMounted(() => target.addEventListener(event, handler, options))
  onUnmounted(() =>
    target.removeEventListener(event, handler, options)
  )
}

