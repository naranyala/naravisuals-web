import { defineComponent, PropType } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

// Define styles using const styles = {} pattern
const styles = {
  base: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;

    &:focus {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  variants: {
    primary: css`
      background-color: #3b82f6;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2563eb;
      }
    `,

    secondary: css`
      background-color: #6b7280;
      color: white;

      &:hover:not(:disabled) {
        background-color: #4b5563;
      }
    `,

    danger: css`
      background-color: #ef4444;
      color: white;

      &:hover:not(:disabled) {
        background-color: #dc2626;
      }
    `,

    outline: css`
      background-color: transparent;
      border: 1px solid #d1d5db;
      color: #374151;

      &:hover:not(:disabled) {
        background-color: #f9fafb;
      }
    `
  },

  sizes: {
    sm: css`
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    `,
    md: css`
      padding: 0.5rem 1rem;
      font-size: 1rem;
    `,
    lg: css`
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    `
  }
}

// TypeScript interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: (event: Event) => void
}

export default defineComponent({
  name: 'Button',

  props: {
    variant: {
      type: String as PropType<ButtonProps['variant']>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonProps['size']>,
      default: 'md'
    },
    disabled: Boolean,
    loading: Boolean,
    className: String,
    onClick: Function as PropType<ButtonProps['onClick']>
  },

  setup(props, { slots, emit }) {
    const handleClick = (event: Event) => {
      if (!props.disabled && !props.loading && props.onClick) {
        props.onClick(event)
      }
    }

    return () => (
      <button
        class={clsx(
          styles.base,
          styles.variants[props.variant || 'primary'],
          styles.sizes[props.size || 'md'],
          props.className
        )}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
      >
        {props.loading ? 'Loading...' : slots.default?.()}
      </button>
    )
  }
})
