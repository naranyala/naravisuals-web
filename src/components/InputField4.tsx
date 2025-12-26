import { defineComponent, ref, PropType, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  label: css`
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  `,

  input: css`
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;
    outline: none;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
  `,

  error: css`
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
  `,

  message: css`
    font-size: 0.875rem;
    color: #ef4444;
  `
}

interface InputProps {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

export default defineComponent({
  name: 'Input',

  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    disabled: Boolean,
    error: String,
    required: Boolean
  },

  emits: ['update:modelValue', 'blur', 'focus'],

  setup(props, { emit }) {
    const internalValue = ref(props.modelValue)

    watch(() => props.modelValue, (newValue) => {
      internalValue.value = newValue
    })

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      internalValue.value = target.value
      emit('update:modelValue', target.value)
    }

    return () => (
      <div class={styles.container}>
        {props.label && (
          <label class={styles.label}>
            {props.label}
            {props.required && <span>*</span>}
          </label>
        )}
        <input
          class={clsx(styles.input, props.error && styles.error)}
          type={props.type}
          value={internalValue.value}
          placeholder={props.placeholder}
          disabled={props.disabled}
          required={props.required}
          onInput={handleInput}
          onBlur={(e) => emit('blur', e)}
          onFocus={(e) => emit('focus', e)}
        />
        {props.error && <span class={styles.message}>{props.error}</span>}
      </div>
    )
  }
})
