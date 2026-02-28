import { css } from 'goober';
import { defineComponent } from 'vue';
import { colors, radius, space } from '../tokens';

const styles = {
  root: css`
    background: ${colors.panel};
    border-radius: ${radius.md};
    padding: ${space.md};
    border: 1px solid ${colors.border};
  `,

  header: css`
    font-weight: 600;
    margin-bottom: ${space.sm};
  `,
} as const;

export const Panel = defineComponent({
  name: 'Panel',

  props: {
    title: String,
  },

  setup(props, { slots }) {
    return () => (
      <section class={styles.root}>
        {props.title && <div class={styles.header}>{props.title}</div>}
        {slots.default?.()}
      </section>
    );
  },
});
