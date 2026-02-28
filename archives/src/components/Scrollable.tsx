import { css } from 'goober';
import { defineComponent } from 'vue';

const styles = {
  root: css`
    overflow: auto;
    max-height: 100%;
  `,
} as const;

export const Scrollable = defineComponent({
  name: 'Scrollable',

  setup(_, { slots }) {
    return () => <div class={styles.root}>{slots.default?.()}</div>;
  },
});
