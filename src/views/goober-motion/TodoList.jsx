
import { defineComponent, ref, watch } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';

// Group styles into a single object
const styles = {
    container: css`
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      `,
    title: css`
        color: #333;
        text-align: center;
      `,
    input: css`
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
      `,
    list: css`
        list-style: none;
        padding: 0;
      `,
    todoItem: css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        color: black;

        &:hover {
          background: #e0e0e0;
        }

        .completed {
          text-decoration: line-through;
          color: #888;
        }
      `,
    deleteButton: css`
        background: none;
        border: none;
        color: #ff4444;
        cursor: pointer;
        font-size: 18px;
      `,
};

export default defineComponent({
    setup() {
        const newTodo = ref('');
        const todos = ref([]);

        // Add a new todo
        const addTodo = () => {
            if (newTodo.value.trim() === '') return;
            todos.value.push({ text: newTodo.value, completed: false });
            newTodo.value = '';
        };

        // Toggle todo completion
        const toggleTodo = (index) => {
            todos.value[index].completed = !todos.value[index].completed;
        };

        // Remove a todo with animation
        const removeTodo = (index) => {
            const element = document.querySelector(`li:nth-child(${index + 1})`);
            animate(
                element,
                { opacity: 0, height: 0, margin: 0, padding: 0 },
                { duration: 0.3 }
            ).finished.then(() => {
                todos.value.splice(index, 1);
            });
        };

        // Watch for changes in todos (optional)
        watch(todos, (newTodos) => {
            console.log('Todos updated:', newTodos);
        }, { deep: true });

        return () => (
            <div class={styles.container}>
                <h1 class={styles.title}>Todo List</h1>
                <input
                    type="text"
                    v-model={newTodo.value}
                    onKeyup={(e) => e.key === 'Enter' && addTodo()}
                    class={styles.input}
                    placeholder="Add a new task..."
                />
                <ul class={styles.list}>
                    {todos.value.map((todo, index) => (
                        <li
                            key={index}
                            class={styles.todoItem}
                            onClick={() => toggleTodo(index)}
                        >
                            <span class={todo.completed ? 'completed' : ''}>
                                {todo.text}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeTodo(index); }}
                                class={styles.deleteButton}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    },
});
