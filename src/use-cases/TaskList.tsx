import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';
import TaskItem from './TaskItem.tsx';

// Styles
const styles = {
  list: css`
    list-style: none;
    padding: 0;
  `,
  empty: css`
    text-align: center;
    color: #888;
    font-style: italic;
  `,
};

// Props interface (reusing Task type from App)
interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default defineComponent({
  props: {
    tasks: {
      type: Array as PropType<TaskListProps['tasks']>,
      required: true,
    },
    onToggle: {
      type: Function as PropType<TaskListProps['onToggle']>,
      required: true,
    },
    onDelete: {
      type: Function as PropType<TaskListProps['onDelete']>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      props.tasks.length ? (
        <ul class={styles.list}>
          {props.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={props.onToggle}
              onDelete={props.onDelete}
            />
          ))}
        </ul>
      ) : (
        <p class={styles.empty}>No tasks yet. Add one above!</p>
      )
    );
  },
});
