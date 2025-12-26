import { defineComponent, PropType } from 'vue'
import { css } from 'goober'

type StackDirection = 'row' | 'column'
type StackAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface StackProps {
  direction?: StackDirection
  spacing?: StackSpacing
  align?: StackAlignment
  justify?: StackJustify
  wrap?: boolean
  className?: string
}

const styles = {
  stack: css`
    display: flex;
  `,

  directions: {
    row: css`flex-direction: row;`,
    column: css`flex-direction: column;`
  },

  alignments: {
    start: css`align-items: flex-start;`,
    center: css`align-items: center;`,
    end: css`align-items: flex-end;`,
    stretch: css`align-items: stretch;`,
    baseline: css`align-items: baseline;`
  },

  justifications: {
    start: css`justify-content: flex-start;`,
    center: css`justify-content: center;`,
    end: css`justify-content: flex-end;`,
    between: css`justify-content: space-between;`,
    around: css`justify-content: space-around;`,
    evenly: css`justify-content: space-evenly;`
  },

  spacings: {
    none: css`gap: 0;`,
    xs: css`gap: 0.25rem;`,
    sm: css`gap: 0.5rem;`,
    md: css`gap: 1rem;`,
    lg: css`gap: 1.5rem;`,
    xl: css`gap: 2rem;`,
    '2xl': css`gap: 3rem;`
  },

  wrap: css`flex-wrap: wrap;`
}

export default defineComponent({
  name: 'Stack',

  props: {
    direction: {
      type: String as PropType<StackDirection>,
      default: 'column'
    },
    spacing: {
      type: String as PropType<StackSpacing>,
      default: 'md'
    },
    align: {
      type: String as PropType<StackAlignment>,
      default: 'stretch'
    },
    justify: {
      type: String as PropType<StackJustify>,
      default: 'start'
    },
    wrap: Boolean,
    className: String
  },

  setup(props, { slots }) {
    return () => (
      <div class={[
        styles.stack,
        styles.directions[props.direction!],
        styles.spacings[props.spacing!],
        styles.alignments[props.align!],
        styles.justifications[props.justify!],
        props.wrap && styles.wrap,
        props.className
      ].filter(Boolean).join(' ')}>
        {slots.default?.()}
      </div>
    )
  }
})
