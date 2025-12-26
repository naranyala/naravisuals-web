import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Define styles as an object with css`` for type-safe, modular CSS-in-JS
const styles = {
  base: css`
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
  `,
  primary: css`
    background: #007bff;
    color: white;
    &:hover {
      background: #0056b3;
    }
  `,
  secondary: css`
    background: #6c757d;
    color: white;
    &:hover {
      background: #545b62;
    }
  `,
};

// Type-safe props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default defineComponent({
  props: {
    variant: {
      type: String as PropType<ButtonProps['variant']>,
      default: 'primary',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () => (
      <button
        class={clsx(
          styles.base,
          props.variant === 'primary' ? styles.primary : styles.secondary,
          props.disabled && 'opacity-50 cursor-not-allowed' // Inline conditional without Goober for simplicity
        )}
        disabled={props.disabled}
      >
        {slots.default?.()}
      </button>
    );
  },
});
