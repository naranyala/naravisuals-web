import { defineComponent, PropType, ref } from 'vue'
import { css, keyframes } from 'goober'
import clsx from 'clsx'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee?: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const styles = {
  board: css`
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    min-height: 500px;
    overflow-x: auto;
  `,

  column: css`
    flex: 1;
    min-width: 300px;
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `,

  columnHeader: css`
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  taskCount: css`
    background: #f3f4f6;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  `,

  taskList: css`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 200px;
  `,

  task: css`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: move;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }

    &.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  `,

  taskTitle: css`
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.5rem;
  `,

  taskDescription: css`
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  `,

  taskMeta: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  priority: css`
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;

    &.high {
      background: #fee2e2;
      color: #dc2626;
    }

    &.medium {
      background: #fef3c7;
      color: #d97706;
    }

    &.low {
      background: #d1fae5;
      color: #059669;
    }
  `,

  assignee: css`
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
  `,

  dropZone: css`
    border: 2px dashed transparent;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    &.active {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  `
}

export default defineComponent({
  name: 'KanbanBoard',

  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    className: String
  },

  emits: ['task-move'],

  setup(props, { emit }) {
    const draggedTask = ref<Task | null>(null)
    const draggedFromColumn = ref<string | null>(null)
    const dragOverColumn = ref<string | null>(null)

    const handleDragStart = (task: Task, columnId: string) => {
      draggedTask.value = task
      draggedFromColumn.value = columnId
    }

    const handleDragOver = (e: DragEvent, columnId: string) => {
      e.preventDefault()
      dragOverColumn.value = columnId
    }

    const handleDragLeave = () => {
      dragOverColumn.value = null
    }

    const handleDrop = (e: DragEvent, targetColumnId: string) => {
      e.preventDefault()

      if (!draggedTask.value || !draggedFromColumn.value) return

      if (draggedFromColumn.value !== targetColumnId) {
        emit('task-move', {
          task: draggedTask.value,
          fromColumn: draggedFromColumn.value,
          toColumn: targetColumnId
        })
      }

      draggedTask.value = null
      draggedFromColumn.value = null
      dragOverColumn.value = null
    }

    return () => (
      <div class={clsx(styles.board, props.className)}>
        {props.columns.map(column => (
          <div
            key={column.id}
            class={clsx(
              styles.column,
              styles.dropZone,
              dragOverColumn.value === column.id && 'active'
            )}
            onDragover={(e) => handleDragOver(e, column.id)}
            onDragleave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div class={styles.columnHeader}>
              <span>{column.title}</span>
              <span class={styles.taskCount}>{column.tasks.length}</span>
            </div>

            <div class={styles.taskList}>
              {column.tasks.map(task => (
                <div
                  key={task.id}
                  class={clsx(styles.task, 'dragging')}
                  draggable
                  onDragstart={() => handleDragStart(task, column.id)}
                >
                  <div class={styles.taskTitle}>{task.title}</div>
                  <div class={styles.taskDescription}>{task.description}</div>
                  <div class={styles.taskMeta}>
                    <span class={clsx(styles.priority, task.priority)}>
                      {task.priority}
                    </span>
                    {task.assignee && (
                      <div class={styles.assignee}>
                        {task.assignee.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
})
