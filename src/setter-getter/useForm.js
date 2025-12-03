// useForm.js
import { reactive, computed } from 'vue'

export function useForm(initialFields) {
  const fields = reactive({ ...initialFields })
  const errors = reactive({})

  const get = (fieldName) => {
    return fields[fieldName]
  }

  const set = (fieldName, value) => {
    fields[fieldName] = value
    // Clear error when field is updated
    if (errors[fieldName]) {
      delete errors[fieldName]
    }
  }

  const setError = (fieldName, errorMessage) => {
    errors[fieldName] = errorMessage
  }

  const validate = (validators) => {
    Object.keys(validators).forEach(fieldName => {
      const validator = validators[fieldName]
      const value = fields[fieldName]
      const error = validator(value)

      if (error) {
        errors[fieldName] = error
      } else if (errors[fieldName]) {
        delete errors[fieldName]
      }
    })

    return Object.keys(errors).length === 0
  }

  const reset = () => {
    Object.keys(fields).forEach(key => {
      fields[key] = initialFields[key]
    })
    Object.keys(errors).forEach(key => {
      delete errors[key]
    })
  }

  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  return {
    get,
    set,
    setError,
    validate,
    reset,
    isValid,
    fields,
    errors
  }
}
