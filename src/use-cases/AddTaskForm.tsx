import { defineComponent, ref, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Dynamic styles object
const styles = {
  form: css`
    display: flex;
    margin-bottom: 20px;
  `,
  input: (hasValue: boolean) => css`
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
    background: white;
    color: black;
    width: auto;
  `,
  button: css`
    width: 100px;
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    &:hover {
      background: #218838;
    }
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  `,
};

// Props interface
interface AddTaskFormProps {
  onAdd: (text: string) => void;
}

export default defineComponent({
  props: {
    onAdd: {
      type: Function as PropType<AddTaskFormProps['onAdd']>,
      required: true,
    },
  },
  setup(props) {
    const inputValue = ref('');

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      props.onAdd(inputValue.value);
      inputValue.value = '';
    };

    return () => (
      <form class={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue.value}
          onInput={(e) => (inputValue.value = (e.target as HTMLInputElement).value)}
          placeholder="Add a new task..."
          class={clsx(styles.input(!!inputValue.value))} // Dynamic based on value
        />
        <button class={styles.button} type="submit" disabled={!inputValue.value.trim()}>
          Add
        </button>
      </form>
    );
  },
});
