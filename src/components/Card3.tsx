import { defineComponent, PropType } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

const styles = {
  card: css`
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: box-shadow 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `,

  header: css`
    padding: 1.5rem 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;

    &:empty {
      display: none;
    }
  `,

  body: css`
    padding: 1.5rem;
  `,

  footer: css`
    padding: 0 1.5rem 1.5rem;
    border-top: 1px solid #e5e7eb;

    &:empty {
      display: none;
    }
  `,

  variants: {
    elevated: css`
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `,
    outlined: css`
      border: 1px solid #d1d5db;
      box-shadow: none;
    `
  }
}

interface CardProps {
  variant?: 'elevated' | 'outlined' | 'default'
  className?: string
}

export default defineComponent({
  name: 'Card',

  props: {
    variant: {
      type: String as PropType<CardProps['variant']>,
      default: 'default'
    },
    className: String
  },

  setup(props, { slots }) {
    return () => (
      <div
        class={clsx(
          styles.card,
          props.variant !== 'default' && styles.variants[props.variant!],
          props.className
        )}
      >
        <div class={styles.header}>{slots.header?.()}</div>
        <div class={styles.body}>{slots.default?.()}</div>
        <div class={styles.footer}>{slots.footer?.()}</div>
      </div>
    )
  }
})
