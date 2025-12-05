// useIdle.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useIdle(timeout = 300000, events = ['mousemove', 'keydown', 'scroll', 'click']) {
  const isIdle = ref(false)
  const lastActive = ref(Date.now())
  const idleTime = ref(0)

  let timer

  const get = () => isIdle.value
  const getIdleTime = () => idleTime.value
  const getLastActive = () => lastActive.value
  const getSecondsIdle = () => Math.floor(idleTime.value / 1000)

  const reset = () => {
    lastActive.value = Date.now()
    isIdle.value = false
    idleTime.value = 0
    clearTimeout(timer)
    startTimer()
  }

  const startTimer = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      isIdle.value = true
      updateIdleTime()
    }, timeout)
  }

  const updateIdleTime = () => {
    if (isIdle.value) {
      idleTime.value = Date.now() - lastActive.value
      requestAnimationFrame(updateIdleTime)
    }
  }

  const onActivity = () => {
    if (isIdle.value) {
      isIdle.value = false
      idleTime.value = 0
    }
    lastActive.value = Date.now()
    startTimer()
  }

  const addEvents = () => {
    events.forEach(event => {
      window.addEventListener(event, onActivity, { passive: true })
    })

    // Also track visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Consider idle when tab is hidden
        isIdle.value = true
        updateIdleTime()
      } else {
        onActivity()
      }
    })
  }

  const removeEvents = () => {
    events.forEach(event => {
      window.removeEventListener(event, onActivity)
    })
    document.removeEventListener('visibilitychange', onActivity)
    clearTimeout(timer)
  }

  const setConfig = (newTimeout, newEvents) => {
    removeEvents()
    timeout = newTimeout || timeout
    events = newEvents || events
    addEvents()
    reset()
  }

  onMounted(() => {
    addEvents()
    startTimer()
  })

  onUnmounted(() => {
    removeEvents()
  })

  return {
    get,
    getIdleTime,
    getLastActive,
    getSecondsIdle,
    reset,
    setConfig,
    isIdle,
    idleTime,
    lastActive
  }
}
