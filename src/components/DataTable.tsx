import { defineComponent, PropType, ref, computed } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface Column {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => any
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  striped?: boolean
  bordered?: boolean
  hover?: boolean
  className?: string
}

const styles = {
  container: css`
    width: 100%;
    overflow-x: auto;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `,

  table: css`
    width: 100%;
    border-collapse: collapse;
    background: white;
  `,

  header: css`
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  `,

  headerCell: css`
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  bodyRow: css`
    border-bottom: 1px solid #e5e7eb;
    transition: background-color 0.15s ease;

    &:last-child {
      border-bottom: none;
    }
  `,

  striped: css`
    &:nth-child(even) {
      background: #f9fafb;
    }
  `,

  hover: css`
    &:hover {
      background: #f3f4f6;
    }
  `,

  bodyCell: css`
    padding: 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  `,

  loading: css`
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  `,

  empty: css`
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  `
}

export default defineComponent({
  name: 'DataTable',

  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    data: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    loading: Boolean,
    striped: Boolean,
    bordered: Boolean,
    hover: Boolean,
    className: String
  },

  setup(props) {
    const sortColumn = ref<string | null>(null)
    const sortDirection = ref<'asc' | 'desc'>('asc')

    const sortedData = computed(() => {
      if (!sortColumn.value) return props.data

      return [...props.data].sort((a, b) => {
        const aVal = a[sortColumn.value!]
        const bVal = b[sortColumn.value!]

        if (sortDirection.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    })

    const handleSort = (column: Column) => {
      if (sortColumn.value === column.key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column.key
        sortDirection.value = 'asc'
      }
    }

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <table class={styles.table}>
          <thead class={styles.header}>
            <tr>
              {props.columns.map(column => (
                <th
                  key={column.key}
                  class={styles.headerCell}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSort(column)}
                >
                  {column.title}
                  {sortColumn.value === column.key && (
                    <span style={{ marginLeft: '0.25rem' }}>
                      {sortDirection.value === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.loading ? (
              <tr>
                <td colspan={props.columns.length} class={styles.loading}>
                  Loading...
                </td>
              </tr>
            ) : sortedData.value.length === 0 ? (
              <tr>
                <td colspan={props.columns.length} class={styles.empty}>
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.value.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  class={clsx(
                    styles.bodyRow,
                    props.striped && styles.striped,
                    props.hover && styles.hover
                  )}
                >
                  {props.columns.map(column => (
                    <td
                      key={column.key}
                      class={styles.bodyCell}
                      style={{
                        textAlign: column.align || 'left'
                      }}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }
})
