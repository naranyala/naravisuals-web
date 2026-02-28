import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent } from 'vue';
import { colors, radius } from '../tokens';

const styles = {
  base: css`
    background: ${colors.bg};
    color: ${colors.text};
    border: 1px solid ${colors.border};
    border-radius: ${radius.sm};
    padding: 0.4rem 0.6rem;
    outline: none;

    &:focus {
      border-color: ${colors.primary};
    }
  `,

  invalid: css`
    border-color: ${colors.danger};
  `,
} as const;

export const Input = defineComponent({
  name: 'Input',

  props: {
    modelValue: String,
    invalid: Boolean,
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    return () => (
      <input
        class={clsx(styles.base, props.invalid && styles.invalid)}
        value={props.modelValue}
        onInput={(e) =>
          emit('update:modelValue', (e.target as HTMLInputElement).value)
        }
      />
    );
  },
});
