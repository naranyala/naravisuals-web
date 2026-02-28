import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent } from 'vue';
import { colors, radius } from '../tokens';

const styles = {
  base: css`
    padding: 0.45rem 0.9rem;
    border-radius: ${radius.sm};
    border: none;
    cursor: pointer;
    font-weight: 600;
  `,

  primary: css`
    background: ${colors.primary};
    color: white;
  `,

  danger: css`
    background: ${colors.danger};
    color: white;
  `,
} as const;

type Variant = 'primary' | 'danger';

export const Button = defineComponent({
  name: 'Button',

  props: {
    variant: {
      type: String as () => Variant,
      default: 'primary',
    },
  },

  setup(props, { slots }) {
    return () => (
      <button class={clsx(styles.base, styles[props.variant])}>
        {slots.default?.()}
      </button>
    );
  },
});
