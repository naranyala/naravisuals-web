<template>
  <div class="data-table">
    <div class="table-header">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="['column-header', column.align]"
            @click="column.sortable && sortBy(column.key)"
          >
            <span class="column-title">{{ column.title }}</span>
            <span
              v-if="column.sortable"
              :class="['sort-icon', { active: sortBy === column.key }]"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in sortedData"
          :key="row.id || index"
          :class="['table-row', { clickable: selectable }]"
          @click="selectable && $emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['cell', column.align]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="loading-state">
      <LoadingSpinner />
      <span>Loading data...</span>
    </div>

    <div v-else-if="sortedData.length === 0" class="empty-state">
      <slot name="empty">
        No data available
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['row-click'])

const sortBy = ref('')
const sortOrder = ref('asc')

const sortedData = computed(() => {
  if (!sortBy.value) return props.data

  return [...props.data].sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const sortByColumn = (columnKey) => {
  if (sortBy.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = columnKey
    sortOrder.value = 'asc'
  }
}
</script>

<style scoped>
.data-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  padding: 16px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.column-header {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  user-select: none;
}

.column-header.left {
  text-align: left;
}

.column-header.center {
  text-align: center;
}

.column-header.right {
  text-align: right;
}

.column-title {
  margin-right: 8px;
}

.sort-icon {
  opacity: 0.5;
}

.sort-icon.active {
  opacity: 1;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-row.clickable {
  cursor: pointer;
}

.table-row.clickable:hover {
  background-color: #f3f4f6;
}

.cell {
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;
}

.cell.left {
  text-align: left;
}

.cell.center {
  text-align: center;
}

.cell.right {
  text-align: right;
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  background-color: white;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
