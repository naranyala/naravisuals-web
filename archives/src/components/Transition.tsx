import { css, keyframes } from 'goober';
import { defineComponent, type PropType } from 'vue';

type TransitionType = 'fade' | 'slide' | 'scale' | 'bounce' | 'custom';
type TransitionDirection = 'up' | 'down' | 'left' | 'right';

interface TransitionProps {
  show: boolean;
  type?: TransitionType;
  direction?: TransitionDirection;
  duration?: number;
  delay?: number;
  className?: string;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0); }
  to { transform: scale(1); }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;

const styles = {
  transition: css`
    animation-fill-mode: both;
  `,

  types: {
    fade: css`animation-name: ${fadeIn};`,
    slide: css`animation-name: ${slideInUp};`,
    scale: css`animation-name: ${scaleIn};`,
    bounce: css`animation-name: ${bounceIn};`,
  },

  directions: {
    up: css`transform-origin: bottom;`,
    down: css`transform-origin: top;`,
    left: css`transform-origin: right;`,
    right: css`transform-origin: left;`,
  },
};

export default defineComponent({
  name: 'Transition',

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String as PropType<TransitionType>,
      default: 'fade',
    },
    direction: {
      type: String as PropType<TransitionDirection>,
      default: 'up',
    },
    duration: {
      type: Number,
      default: 300,
    },
    delay: {
      type: Number,
      default: 0,
    },
    className: String,
  },

  setup(props, { slots }) {
    return () => {
      if (!props.show) return null;

      const animationStyle = {
        animationDuration: `${props.duration}ms`,
        animationDelay: `${props.delay}ms`,
      };

      return (
        <div
          class={[
            styles.transition,
            styles.types[props.type],
            styles.directions[props.direction],
            props.className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={animationStyle}
        >
          {slots.default?.()}
        </div>
      );
    };
  },
});
