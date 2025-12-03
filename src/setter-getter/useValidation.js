// composables/useValidation.js
import { ref, computed } from 'vue'

export function useValidation(initialValue = '', validator = (v) => true) {
  const raw = ref(initialValue)
  const isValid = ref(validator(initialValue))

  const value = computed({
    get: () => raw.value,
    set: (newVal) => {
      raw.value = newVal
      isValid.value = validator(newVal)
    }
  })

  return {
    value,      // getter/setter
    isValid: isValid, // ref<boolean>
    validate: () => { isValid.value = validator(raw.value) }
  }
}
