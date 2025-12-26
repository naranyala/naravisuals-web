import { defineComponent, PropType, reactive, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: any }[]
  validation?: (value: any) => string | null
}

interface FormProps {
  fields: FormField[]
  initialValues?: Record<string, any>
  className?: string
}

const styles = {
  form: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,

  fieldGroup: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  label: css`
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;

    &.required::after {
      content: ' *';
      color: #ef4444;
    }
  `,

  input: css`
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
  `,

  textarea: css`
    min-height: 100px;
    resize: vertical;
  `,

  select: css`
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `,

  checkboxGroup: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  checkboxItem: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `,

  checkbox: css`
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  `,

  radioGroup: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  radioItem: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `,

  radio: css`
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  `,

  error: css`
    font-size: 0.875rem;
    color: #ef4444;
    margin-top: 0.25rem;
  `,

  submitButton: css`
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
}

export default defineComponent({
  name: 'FormSection',

  props: {
    fields: {
      type: Array as PropType<FormField[]>,
      required: true
    },
    initialValues: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    className: String
  },

  emits: ['submit'],

  setup(props, { emit }) {
    const formData = reactive<Record<string, any>>({})
    const errors = reactive<Record<string, string>>({})

    // Initialize form data
    watch(() => props.initialValues, (newValues) => {
      Object.assign(formData, newValues)
    }, { immediate: true })

    const validateField = (field: FormField, value: any) => {
      if (field.required && !value) {
        return `${field.label} is required`
      }
      if (field.validation) {
        return field.validation(value)
      }
      return null
    }

    const handleFieldChange = (field: FormField, value: any) => {
      formData[field.name] = value
      const error = validateField(field, value)
      errors[field.name] = error || ''
    }

    const handleSubmit = (e: Event) => {
      e.preventDefault()

      // Validate all fields
      let hasErrors = false
      props.fields.forEach(field => {
        const error = validateField(field, formData[field.name])
        errors[field.name] = error || ''
        if (error) hasErrors = true
      })

      if (!hasErrors) {
        emit('submit', { ...formData })
      }
    }

    const renderField = (field: FormField) => {
      const value = formData[field.name]
      const error = errors[field.name]

      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              class={clsx(styles.input, styles.textarea)}
              value={value}
              placeholder={field.placeholder}
              disabled={field.disabled}
              onInput={(e: Event) => handleFieldChange(field, (e.target as HTMLTextAreaElement).value)}
            />
          )

        case 'select':
          return (
            <select
              class={styles.select}
              value={value}
              disabled={field.disabled}
              onChange={(e: Event) => handleFieldChange(field, (e.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )

        case 'checkbox':
          return (
            <div class={styles.checkboxGroup}>
              {field.options?.map(option => (
                <label key={option.value} class={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    class={styles.checkbox}
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    disabled={field.disabled}
                    onChange={(e: Event) => {
                      const checked = (e.target as HTMLInputElement).checked
                      const currentValues = Array.isArray(value) ? value : []
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value)
                      handleFieldChange(field, newValues)
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )

        case 'radio':
          return (
            <div class={styles.radioGroup}>
              {field.options?.map(option => (
                <label key={option.value} class={styles.radioItem}>
                  <input
                    type="radio"
                    class={styles.radio}
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    disabled={field.disabled}
                    onChange={(e: Event) => handleFieldChange(field, (e.target as HTMLInputElement).value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )

        default:
          return (
            <input
              type={field.type}
              class={styles.input}
              value={value}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              onInput={(e: Event) => handleFieldChange(field, (e.target as HTMLInputElement).value)}
            />
          )
      }
    }

    return () => (
      <form class={clsx(styles.form, props.className)} onSubmit={handleSubmit}>
        {props.fields.map(field => (
          <div key={field.name} class={styles.fieldGroup}>
            <label class={clsx(styles.label, field.required && 'required')}>
              {field.label}
            </label>
            {renderField(field)}
            {errors[field.name] && (
              <div class={styles.error}>{errors[field.name]}</div>
            )}
          </div>
        ))}

        <button type="submit" class={styles.submitButton}>
          Submit
        </button>
      </form>
    )
  }
})
