import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

type ContainerTag =
  | 'div'
  | 'section'
  | 'article'
  | 'main'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav';
type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface ContainerProps {
  tag?: ContainerTag;
  size?: ContainerSize;
  padding?: ContainerPadding;
  centered?: boolean;
  fluid?: boolean;
  className?: string;
  style?: Record<string, any>;
}

const styles = {
  container: css`
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  `,

  sizes: {
    xs: css`max-width: 640px;`,
    sm: css`max-width: 768px;`,
    md: css`max-width: 1024px;`,
    lg: css`max-width: 1280px;`,
    xl: css`max-width: 1536px;`,
    full: css`max-width: 100%;`,
  },

  paddings: {
    none: css`padding: 0;`,
    sm: css`padding: 1rem;`,
    md: css`padding: 1.5rem;`,
    lg: css`padding: 2rem;`,
    xl: css`padding: 3rem;`,
  },

  centered: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  `,

  fluid: css`
    max-width: 100%;
    padding: 0;
  `,
};

export default defineComponent({
  name: 'Container',

  props: {
    tag: {
      type: String as PropType<ContainerTag>,
      default: 'div',
    },
    size: {
      type: String as PropType<ContainerSize>,
      default: 'md',
    },
    padding: {
      type: String as PropType<ContainerPadding>,
      default: 'md',
    },
    centered: Boolean,
    fluid: Boolean,
    className: String,
    style: Object,
  },

  setup(props, { slots }) {
    return () => {
      const Tag = props.tag as any;
      const classes = clsx(
        styles.container,
        styles.sizes[props.size!],
        styles.paddings[props.padding!],
        props.centered && styles.centered,
        props.fluid && styles.fluid,
        props.className,
      );

      return (
        <Tag class={classes} style={props.style}>
          {slots.default?.()}
        </Tag>
      );
    };
  },
});
