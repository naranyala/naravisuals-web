import { defineComponent, type PropType, ref, watch } from 'vue';

interface DebouncedInputProps {
  modelValue: string;
  delay?: number;
  render: (props: {
    value: string;
    onInput: (value: string) => void;
    onChange: (value: string) => void;
  }) => any;
}

export default defineComponent({
  name: 'DebouncedInput',

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    delay: {
      type: Number,
      default: 300,
    },
    render: {
      type: Function as PropType<(props: any) => any>,
      required: true,
    },
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const internalValue = ref(props.modelValue);
    const debounceTimer = ref<NodeJS.Timeout | null>(null);

    watch(
      () => props.modelValue,
      (newValue) => {
        internalValue.value = newValue;
      },
    );

    const debounce = (fn: Function) => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
      }

      debounceTimer.value = setTimeout(() => {
        fn();
        debounceTimer.value = null;
      }, props.delay);
    };

    const handleInput = (value: string) => {
      internalValue.value = value;
      debounce(() => {
        emit('update:modelValue', value);
      });
    };

    const handleChange = (value: string) => {
      internalValue.value = value;
      debounce(() => {
        emit('change', value);
      });
    };

    return () =>
      props.render({
        value: internalValue.value,
        onInput: handleInput,
        onChange: handleChange,
      });
  },
});
