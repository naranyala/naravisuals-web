import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

// Props interface for type safety
interface CardProps {
  theme: 'light' | 'dark';
  highlighted?: boolean;
}

// Dynamic styles object – functions return css`` with prop interpolation
const styles = {
  container: (props: CardProps) => css`
    padding: 16px;
    border-radius: 8px;
    background: ${props.theme === 'light' ? '#ffffff' : '#333333'};
    color: ${props.theme === 'light' ? '#000000' : '#ffffff'};
    border: 1px solid ${props.highlighted ? '#ffcc00' : 'transparent'};
    box-shadow: ${props.highlighted ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none'};
  `,
  title: css`
    font-size: 20px;
    margin-bottom: 8px;
  `,
};

export default defineComponent({
  name: 'Card',
  props: {
    theme: {
      type: String as PropType<CardProps['theme']>,
      required: true,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () => (
      <div
        class={clsx(
          styles.container(props), // Pass props for dynamic styling
          props.highlighted && 'animate-pulse', // Additional conditional class
        )}
      >
        <h2 class={styles.title}>{slots.title?.()}</h2>
        <div>{slots.default?.()}</div>
      </div>
    );
  },
});
