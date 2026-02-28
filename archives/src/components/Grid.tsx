import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type GridBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GridProps {
  cols?: GridCols | Record<GridBreakpoint, GridCols>;
  gap?: GridGap | Record<GridBreakpoint, GridGap>;
  className?: string;
}

const styles = {
  grid: css`
    display: grid;
  `,

  cols: {
    1: css`grid-template-columns: repeat(1, minmax(0, 1fr));`,
    2: css`grid-template-columns: repeat(2, minmax(0, 1fr));`,
    3: css`grid-template-columns: repeat(3, minmax(0, 1fr));`,
    4: css`grid-template-columns: repeat(4, minmax(0, 1fr));`,
    5: css`grid-template-columns: repeat(5, minmax(0, 1fr));`,
    6: css`grid-template-columns: repeat(6, minmax(0, 1fr));`,
    7: css`grid-template-columns: repeat(7, minmax(0, 1fr));`,
    8: css`grid-template-columns: repeat(8, minmax(0, 1fr));`,
    9: css`grid-template-columns: repeat(9, minmax(0, 1fr));`,
    10: css`grid-template-columns: repeat(10, minmax(0, 1fr));`,
    11: css`grid-template-columns: repeat(11, minmax(0, 1fr));`,
    12: css`grid-template-columns: repeat(12, minmax(0, 1fr));`,
  },

  gaps: {
    none: css`gap: 0;`,
    xs: css`gap: 0.5rem;`,
    sm: css`gap: 1rem;`,
    md: css`gap: 1.5rem;`,
    lg: css`gap: 2rem;`,
    xl: css`gap: 2.5rem;`,
  },
};

export default defineComponent({
  name: 'Grid',

  props: {
    cols: {
      type: [Number, Object] as PropType<
        GridCols | Record<GridBreakpoint, GridCols>
      >,
      default: 3,
    },
    gap: {
      type: [String, Object] as PropType<
        GridGap | Record<GridBreakpoint, GridGap>
      >,
      default: 'md',
    },
    className: String,
  },

  setup(props, { slots }) {
    const getResponsiveClasses = () => {
      const classes: string[] = [styles.grid];

      if (typeof props.cols === 'number') {
        classes.push(styles.cols[props.cols]);
      } else {
        // Handle responsive breakpoints
        Object.entries(props.cols).forEach(([breakpoint, cols]) => {
          // This would need actual responsive implementation
          classes.push(styles.cols[cols as GridCols]);
        });
      }

      if (typeof props.gap === 'string') {
        classes.push(styles.gaps[props.gap]);
      } else {
        // Handle responsive breakpoints
        Object.entries(props.gap).forEach(([breakpoint, gap]) => {
          classes.push(styles.gaps[gap as GridGap]);
        });
      }

      if (props.className) {
        classes.push(props.className);
      }

      return classes.join(' ');
    };

    return () => <div class={getResponsiveClasses()}>{slots.default?.()}</div>;
  },
});
