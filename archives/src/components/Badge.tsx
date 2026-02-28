// components/Badge.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

const styles = {
  base: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  primary: css`background: #dbeafe; color: #1d4ed8;`,
  success: css`background: #dcfce7; color: #166534;`,
  warning: css`background: #fef3c7; color: #92400e;`,
  danger: css`background: #fee2e2; color: #b91c1c;`,
};

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger';

interface Props {
  variant?: BadgeVariant;
}

export default defineComponent({
  name: 'Badge',
  props: {
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'primary',
    },
  },
  setup(props, { slots }) {
    const variantStyle = styles[props.variant] || styles.primary;

    return () => (
      <span class={clsx(styles.base, variantStyle)}>{slots.default?.()}</span>
    );
  },
});
