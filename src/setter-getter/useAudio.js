
// useAudio.js
import { ref, onMounted } from 'vue'

export function useAudio(src) {
  const audio = ref(null)
  const ready = ref(false)

  function get() {
    return audio.value
  }

  function setTime(t) {
    if (audio.value) audio.value.currentTime = t
  }

  function setVolume(v) {
    if (audio.value) audio.value.volume = v
  }

  onMounted(() => {
    audio.value = new Audio(src)
    audio.value.onloadeddata = () => ready.value = true
  })

  function play() { audio.value?.play() }
  function pause() { audio.value?.pause() }

  return { get, ready, play, pause, setTime, setVolume, audio }
}
