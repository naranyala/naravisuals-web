// components/Card.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

const styles = {
  base: css`
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: white;
    overflow: hidden;
    transition: box-shadow 0.2s ease;
  `,
  elevated: css`
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  `,
  paddingSmall: css`padding: 12px;`,
  paddingMedium: css`padding: 16px;`,
  paddingLarge: css`padding: 24px;`,
};

interface Props {
  elevated?: boolean;
  padding?: 'small' | 'medium' | 'large';
}

export default defineComponent({
  name: 'Card',
  props: {
    elevated: { type: Boolean, default: false },
    padding: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
  },
  setup(props, { slots }) {
    const classes = clsx(styles.base, props.elevated && styles.elevated, {
      [styles.paddingSmall]: props.padding === 'small',
      [styles.paddingMedium]: props.padding === 'medium',
      [styles.paddingLarge]: props.padding === 'large',
    });

    return () => <div class={classes}>{slots.default?.()}</div>;
  },
});
