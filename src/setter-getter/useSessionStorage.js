// composables/useSessionStorage.js
import { ref, computed, watch } from 'vue'

export function useSessionStorage(key, initialValue) {
  const stored = sessionStorage.getItem(key)
  const initial = stored !== null ? JSON.parse(stored) : initialValue
  const internal = ref(initial)

  watch(internal, (newVal) => {
    sessionStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  const value = computed({
    get: () => internal.value,
    set: (newVal) => {
      internal.value = newVal
    }
  })

  const clear = () => {
    sessionStorage.removeItem(key)
    internal.value = initialValue
  }

  return { value, clear }
}

// <script setup>
// import { useSessionStorage } from '@/composables/useSessionStorage'
//
// const { value: draft } = useSessionStorage('post-draft', '')
// </script>
//
// <template>
//   <textarea v-model="draft" placeholder="Your draft (cleared when tab closes)"></textarea>
// </template>
