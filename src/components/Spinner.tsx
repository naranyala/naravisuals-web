// components/Spinner.tsx
import { defineComponent, PropType } from 'vue';
import { css, keyframes } from 'goober';
import clsx from 'clsx';

// 1. Define keyframes
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// 2. Styles with animation reference
const styles = {
  base: css`
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  `,
  small: css`width: 16px; height: 16px;`,
  large: css`width: 32px; height: 32px;`,
  primary: css`color: #3b82f6;`,
  danger: css`color: #ef4444;`,
};

type Size = 'small' | 'medium' | 'large';
type Color = 'primary' | 'danger' | 'inherit';

interface Props {
  size?: Size;
  color?: Color;
}

export default defineComponent({
  name: 'Spinner',
  props: {
    size: { type: String as PropType<Size>, default: 'medium' },
    color: { type: String as PropType<Color>, default: 'inherit' },
  },
  setup(props) {
    return () => (
      <div
        class={clsx(
          styles.base,
          styles[props.size],
          props.color !== 'inherit' && styles[props.color]
        )}
        aria-label="Loading"
      />
    );
  },
});
