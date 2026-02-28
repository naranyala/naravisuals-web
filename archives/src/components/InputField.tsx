// components/InputField.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType, ref, watch } from 'vue';

type ValidationState = 'idle' | 'valid' | 'invalid';

interface Props {
  modelValue: string;
  state?: ValidationState;
  disabled?: boolean;
}

export default defineComponent({
  name: 'InputField',
  props: {
    modelValue: { type: String, required: true },
    state: { type: String as PropType<ValidationState>, default: 'idle' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (val) => (internalValue.value = val),
    );

    const handleChange = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      internalValue.value = val;
      emit('update:modelValue', val);
    };

    return () => (
      <input
        type="text"
        value={internalValue.value}
        onInput={handleChange}
        disabled={props.disabled}
        class={clsx(
          styles.base,
          props.state === 'valid' && styles.success,
          props.state === 'invalid' && styles.error,
          props.disabled && styles.disabled,
        )}
      />
    );
  },
});

const styles = {
  base: css`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
  `,
  success: css`border-color: #10b981;`,
  error: css`
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
  `,
  disabled: css`
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.75;
  `,
};
