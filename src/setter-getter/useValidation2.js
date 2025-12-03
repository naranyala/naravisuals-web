// useValidation.js
import { ref, computed } from 'vue'

export function useValidation(initialValue, rules = []) {
  const value = ref(initialValue)
  const errors = ref([])
  const touched = ref(false)

  const get = () => value.value
  const getErrors = () => [...errors.value]
  const getFirstError = () => errors.value[0] || null
  const isTouched = () => touched.value

  const set = (newValue) => {
    value.value = newValue
    validate()
  }

  const setTouched = (isTouched = true) => {
    touched.value = isTouched
    if (isTouched) validate()
  }

  const validate = () => {
    const newErrors = []

    for (const rule of rules) {
      const error = rule(value.value)
      if (error) {
        newErrors.push(error)
        break // Stop at first error if desired
      }
    }

    errors.value = newErrors
    return newErrors.length === 0
  }

  const isValid = computed(() => errors.value.length === 0)
  const hasErrors = computed(() => errors.value.length > 0)

  const reset = () => {
    value.value = initialValue
    errors.value = []
    touched.value = false
  }

  return {
    get,
    getErrors,
    getFirstError,
    isTouched,
    set,
    setTouched,
    validate,
    reset,
    isValid,
    hasErrors,
    value,
    errors
  }
}
