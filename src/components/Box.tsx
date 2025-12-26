import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

type Spacing = '0' | '4' | '8' | '12' | '16' | '24' | '32' | '40';
type Display = 'block' | 'inline' | 'flex' | 'grid' | 'none';

const styles = {
  box: (props: {
    p?: Spacing;
    m?: Spacing;
    display?: Display;
    gap?: Spacing;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    direction?: 'row' | 'column';
    background?: string;
    rounded?: boolean;
  }) => css`
    padding: ${props.p ? `${props.p}px` : '0'};
    margin: ${props.m ? `${props.m}px` : '0'};
    display: ${props.display || 'block'};
    gap: ${props.gap ? `${props.gap}px` : '0'};
    align-items: ${props.align || 'stretch'};
    justify-content: ${props.justify || 'start'};
    flex-direction: ${props.direction || 'row'};
    background: ${props.background || 'transparent'};
    border-radius: ${props.rounded ? '8px' : '0'};
  `,
};

interface BoxProps {
  as?: keyof JSX.IntrinsicElements; // e.g., 'section', 'article'
  p?: Spacing;
  m?: Spacing;
  display?: Display;
  gap?: Spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  direction?: 'row' | 'column';
  background?: string;
  rounded?: boolean;
}

export default defineComponent({
  props: {
    as: { type: String as PropType<BoxProps['as']>, default: 'div' },
    p: { type: String as PropType<BoxProps['p']> },
    m: { type: String as PropType<BoxProps['m']> },
    display: { type: String as PropType<BoxProps['display']> },
    gap: { type: String as PropType<BoxProps['gap']> },
    align: { type: String as PropType<BoxProps['align']> },
    justify: { type: String as PropType<BoxProps['justify']> },
    direction: { type: String as PropType<BoxProps['direction']> },
    background: { type: String },
    rounded: { type: Boolean },
  },
  setup(props, { slots }) {
    return () => {
      const Tag = props.as as keyof JSX.IntrinsicElements;
      return (
        <Tag class={clsx(styles.box(props))}>
          {slots.default?.()}
        </Tag>
      );
    };
  },
});
