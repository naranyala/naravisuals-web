// composables/useForm.ts
import { reactive, computed } from 'vue'

type Validator<T> = (value: T) => string | true

export function useForm<T extends Record<string, any>>(initial: T) {
  const values = reactive({ ...initial })
  const errors = reactive<Record<keyof T, string>>({} as any)
  const touched = reactive<Record<keyof T, boolean>>({} as any)

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    values[key] = value
    touched[key] = true
  }

  const validateField = <K extends keyof T>(
    key: K,
    validator: Validator<T[K]>
  ) => {
    const result = validator(values[key])
    errors[key] = result === true ? '' : result
  }

  const isValid = computed(() => 
    Object.values(errors).every(e => e === '')
  )

  const reset = () => {
    Object.assign(values, initial)
    Object.keys(errors).forEach(k => (errors[k as keyof T] = ''))
    Object.keys(touched).forEach(k => (touched[k as keyof T] = false))
  }

  return {
    values: readonly(values),
    errors: readonly(errors),
    touched: readonly(touched),
    isValid,
    setField,
    validateField,
    reset,
  }
}
