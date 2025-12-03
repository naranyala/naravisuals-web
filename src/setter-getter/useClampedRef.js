// composables/useClampedRef.js
import { ref, computed, watch } from 'vue'

export function useClampedRef(initial, minRef, maxRef) {
  const valueRef = ref(initial)

  // Auto-clamp when bounds change
  watch([minRef, maxRef], () => {
    valueRef.value = Math.min(
      maxRef.value,
      Math.max(minRef.value, valueRef.value)
    )
  }, { immediate: true })

  const value = computed({
    get: () => valueRef.value,
    set: (newVal) => {
      valueRef.value = Math.min(maxRef.value, Math.max(minRef.value, newVal))
    }
  })

  return { value }
}

