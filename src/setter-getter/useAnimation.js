// useAnimation.js
import { ref, onUnmounted } from 'vue'

export function useAnimation(options = {}) {
  const {
    duration = 1000,
    easing = 'linear',
    delay = 0,
    loop = false,
    autoPlay = false
  } = options

  const isPlaying = ref(false)
  const isPaused = ref(false)
  const progress = ref(0)
  const currentTime = ref(0)
  const iteration = ref(0)

  let animationFrame = null
  let startTime = null
  let pauseTime = null

  const getProgress = () => progress.value
  const getCurrentTime = () => currentTime.value
  const getIteration = () => iteration.value
  const getIsPlaying = () => isPlaying.value
  const getIsPaused = () => isPaused.value

  const easingFunctions = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }

  const getEasedProgress = () => {
    const easeFn = easingFunctions[easing] || easingFunctions.linear
    return easeFn(progress.value)
  }

  const play = (callback) => {
    if (isPlaying.value && !isPaused.value) return

    isPlaying.value = true
    isPaused.value = false

    if (pauseTime !== null) {
      // Resume from paused state
      startTime = performance.now() - pauseTime
      pauseTime = null
    } else {
      startTime = performance.now() - (progress.value * duration)
    }

    const animate = (timestamp) => {
      if (!isPlaying.value) return

      if (isPaused.value) {
        pauseTime = timestamp - startTime
        return
      }

      currentTime.value = timestamp - startTime
      progress.value = Math.min(currentTime.value / duration, 1)

      const easedProgress = getEasedProgress()

      if (callback) {
        callback(easedProgress, progress.value, iteration.value)
      }

      if (progress.value >= 1) {
        iteration.value++

        if (loop) {
          startTime = timestamp
          progress.value = 0
          animationFrame = requestAnimationFrame(animate)
        } else {
          stop()
        }
      } else {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
  }

  const pause = () => {
    isPaused.value = true
  }

  const resume = () => {
    isPaused.value = false
    if (isPlaying.value) {
      play()
    }
  }

  const stop = () => {
    isPlaying.value = false
    isPaused.value = false
    progress.value = 0
    currentTime.value = 0
    pauseTime = null

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }

  const seek = (value) => {
    if (value < 0 || value > 1) return

    progress.value = value
    currentTime.value = value * duration

    if (isPlaying.value) {
      startTime = performance.now() - currentTime.value
    }
  }

  const setDuration = (newDuration) => {
    const ratio = currentTime.value / duration
    duration = newDuration
    currentTime.value = ratio * duration
  }

  const setEasing = (newEasing) => {
    if (easingFunctions[newEasing]) {
      easing = newEasing
    }
  }

  // Auto-play if configured
  if (autoPlay) {
    setTimeout(() => play(), delay)
  }

  onUnmounted(() => {
    stop()
  })

  return {
    getProgress,
    getCurrentTime,
    getIteration,
    getIsPlaying,
    getIsPaused,
    getEasedProgress,
    play,
    pause,
    resume,
    stop,
    seek,
    setDuration,
    setEasing,
    isPlaying,
    isPaused,
    progress,
    currentTime,
    iteration
  }
}
