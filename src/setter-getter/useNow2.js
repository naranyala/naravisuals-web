// ~/composables/useNow.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useNow(ms = 1000) {
  const raw = ref(Date.now())
  let id

  const value = computed({
    get() { return raw.value },
    set(v) { raw.value = Number(v) || Date.now() }
  })

  const get = () => value.value
  const set = (v) => { value.value = v }

  onMounted(() => { id = setInterval(() => { raw.value = Date.now() }, ms) })
  onUnmounted(() => clearInterval(id))

  return { raw, value, get, set }
}
