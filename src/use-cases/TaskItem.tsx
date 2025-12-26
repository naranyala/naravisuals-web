import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Styles (dynamic for completion state)
const styles = {
  item: (completed: boolean) => css`
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    background: ${completed ? '#d4edda' : '#fff3cd'};
    border: 1px solid ${completed ? '#c3e6cb' : '#ffeeba'};
    border-radius: 4px;
    text-decoration: ${completed ? 'line-through' : 'none'};
    color: ${completed ? '#6c757d' : '#212529'};
  `,
  checkbox: css`
    margin-right: 10px;
  `,
  text: css`
    flex: 1;
  `,
  delete: css`
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    font-size: 18px;
    &:hover {
      color: #c82333;
    }
  `,
};

// Props interface
interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default defineComponent({
  props: {
    task: {
      type: Object as PropType<TaskItemProps['task']>,
      required: true,
    },
    onToggle: {
      type: Function as PropType<TaskItemProps['onToggle']>,
      required: true,
    },
    onDelete: {
      type: Function as PropType<TaskItemProps['onDelete']>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <li class={clsx(styles.item(props.task.completed))}>
        <input
          type="checkbox"
          checked={props.task.completed}
          onChange={() => props.onToggle(props.task.id)}
          class={styles.checkbox}
        />
        <span class={styles.text}>{props.task.text}</span>
        <button onClick={() => props.onDelete(props.task.id)} class={styles.delete}>
          ×
        </button>
      </li>
    );
  },
});
