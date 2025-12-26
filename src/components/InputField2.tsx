import { defineComponent, PropType, ref, watch } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  label: css`
    font-size: 14px;
    color: #333;
  `,
  input: (error: boolean) => css`
    padding: 10px;
    border: 1px solid ${error ? '#dc3545' : '#ccc'};
    border-radius: 4px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: ${error ? '#dc3545' : '#007bff'};
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  `,
  error: css`
    font-size: 12px;
    color: #dc3545;
  `,
};

interface InputProps {
  modelValue: string;
  label?: string;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'password';
}

export default defineComponent({
  props: {
    modelValue: { type: String, required: true },
    label: { type: String },
    placeholder: { type: String },
    error: { type: String },
    type: { type: String as PropType<InputProps['type']>, default: 'text' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue);

    watch(() => props.modelValue, (val) => (internalValue.value = val));
    watch(internalValue, (val) => emit('update:modelValue', val));

    return () => (
      <div class={styles.wrapper}>
        {props.label && <label class={styles.label}>{props.label}</label>}
        <input
          type={props.type}
          value={internalValue.value}
          onInput={(e) => (internalValue.value = (e.target as HTMLInputElement).value)}
          placeholder={props.placeholder}
          class={clsx(styles.input(!!props.error))}
        />
        {props.error && <span class={styles.error}>{props.error}</span>}
      </div>
    );
  },
});
