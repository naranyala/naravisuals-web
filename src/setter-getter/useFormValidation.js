// composables/useFormValidation.js
import { reactive, computed } from 'vue'

export function useFormValidation(initialValues = {}, rules = {}) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const touched = reactive({})

  const validateField = (field) => {
    if (!rules[field]) return
    const value = values[field]
    for (const rule of rules[field]) {
      const error = rule(value, values)
      if (error) {
        errors[field] = error
        return
      }
    }
    delete errors[field]
  }

  const setField = (field, value) => {
    values[field] = value
    if (touched[field]) validateField(field)
  }

  const touch = (field) => {
    touched[field] = true
    validateField(field)
  }

  const isValid = computed(() => Object.keys(errors).length === 0)

  return [
    { values, errors, touched, isValid },
    { setField, touch, validateField }
  ]
}
