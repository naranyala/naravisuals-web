// components/Stack.tsx
import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Use goober for stable class (supports gap even in older browsers via pseudo)
const styles = {
  horizontal: css`
    display: flex;
    flex-direction: row;
    & > * + * {
      margin-left: var(--stack-spacing, 8px);
    }
  `,
  vertical: css`
    display: flex;
    flex-direction: column;
    & > * + * {
      margin-top: var(--stack-spacing, 8px);
    }
  `,
};

interface StackProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: number; // spacing index (e.g. 2 → 8px)
}

export default defineComponent({
  name: 'Stack',
  props: {
    direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
    spacing: { type: Number, default: 2 }, // maps to space[2] = 8px
  },
  setup(props, { slots }) {
    const spacingPx = [0, 4, 8, 12, 16, 24, 32][props.spacing] || props.spacing * 4;
    const style = { '--stack-spacing': `${spacingPx}px` };

    return () => (
      <div
        class={clsx(
          props.direction === 'horizontal' ? styles.horizontal : styles.vertical
        )}
        style={style}
      >
        {slots.default?.()}
      </div>
    );
  },
});
