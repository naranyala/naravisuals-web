import { defineComponent, ref } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';
import TaskList from './TaskList.tsx';
import AddTaskForm from './AddTaskForm.tsx';

// Styles for the app container (static for simplicity)
const styles = {
  container: css`
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `,
  title: css`
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  `,
};

// Type for task items (shared across components)
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default defineComponent({
  setup() {
    const tasks = ref<Task[]>([]); // Reactive state for tasks

    const addTask = (text: string) => {
      if (text.trim()) {
        tasks.value.push({ id: Date.now(), text, completed: false });
      }
    };

    const toggleTask = (id: number) => {
      const task = tasks.value.find(t => t.id === id);
      if (task) task.completed = !task.completed;
    };

    const deleteTask = (id: number) => {
      tasks.value = tasks.value.filter(t => t.id !== id);
    };

    return () => (
      <div class={styles.container}>
        <h1 class={styles.title}>Task Manager</h1>
        <AddTaskForm onAdd={addTask} />
        <TaskList tasks={tasks.value} onToggle={toggleTask} onDelete={deleteTask} />
      </div>
    );
  },
});
