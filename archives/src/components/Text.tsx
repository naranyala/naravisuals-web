import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent } from 'vue';
import { colors } from '../tokens';

const styles = {
  base: css`
    color: ${colors.text};
    line-height: 1.4;
  `,

  muted: css`
    color: ${colors.muted};
  `,

  sizes: {
    sm: css`font-size: 0.85rem;`,
    md: css`font-size: 1rem;`,
    lg: css`font-size: 1.2rem;`,
  },
} as const;

type Size = keyof typeof styles.sizes;

export const Text = defineComponent({
  name: 'Text',

  props: {
    muted: Boolean,
    size: {
      type: String as () => Size,
      default: 'md',
    },
    as: {
      type: String,
      default: 'p',
    },
  },

  setup(props, { slots }) {
    const Tag = props.as as any;

    return () => (
      <Tag
        class={clsx(
          styles.base,
          styles.sizes[props.size],
          props.muted && styles.muted,
        )}
      >
        {slots.default?.()}
      </Tag>
    );
  },
});
