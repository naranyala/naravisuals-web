<template>
  <div class="sortable-list">
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      :class="[
        'sortable-item',
        {
          'dragging': draggedItem === item,
          'drag-over': dragOverIndex === index,
          'disabled': item.disabled
        }
      ]"
      draggable="true"
      @dragstart="onDragStart(item, index, $event)"
      @dragend="onDragEnd"
      @dragover="onDragOver(index, $event)"
      @dragenter="onDragEnter(index)"
      @dragleave="onDragLeave"
      @drop="onDrop(index, $event)"
    >
      <div class="item-handle" v-if="!item.disabled">
        ⋮⋮
      </div>
      
      <div class="item-content">
        <slot name="item" :item="item" :index="index">
          {{ item }}
        </slot>
      </div>

      <div class="item-actions" v-if="!item.disabled">
        <button
          v-if="index > 0"
          @click="moveItem(index, index - 1)"
          class="action-btn"
          title="Move up"
        >
          ↑
        </button>
        <button
          v-if="index < items.length - 1"
          @click="moveItem(index, index + 1)"
          class="action-btn"
          title="Move down"
        >
          ↓
        </button>
        <button
          v-if="!hideRemove"
          @click="removeItem(index)"
          class="action-btn remove"
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>

    <div
      v-if="items.length === 0"
      class="empty-state"
    >
      <slot name="empty">
        No items to display
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  getItemKey: {
    type: Function,
    default: (item, index) => index
  },
  hideRemove: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'reorder', 'item-remove'])

const draggedItem = ref(null)
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)

const items = ref([...props.modelValue])

const onDragStart = (item, index, event) => {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  
  draggedItem.value = item
  draggedIndex.value = index
  
  // Set drag image
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())
  
  // Add visual feedback
  setTimeout(() => {
    event.target.classList.add('dragging')
  }, 0)
}

const onDragEnd = (event) => {
  draggedItem.value = null
  draggedIndex.value = -1
  dragOverIndex.value = -1
  event.target.classList.remove('dragging')
}

const onDragOver = (index, event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const onDragEnter = (index) => {
  if (index !== draggedIndex.value) {
    dragOverIndex.value = index
  }
}

const onDragLeave = () => {
  dragOverIndex.value = -1
}

const onDrop = (targetIndex, event) => {
  event.preventDefault()
  
  if (draggedIndex.value === -1 || draggedIndex.value === targetIndex) {
    return
  }
  
  moveItem(draggedIndex.value, targetIndex)
  dragOverIndex.value = -1
}

const moveItem = (fromIndex, toIndex) => {
  const newItems = [...items.value]
  const [movedItem] = newItems.splice(fromIndex, 1)
  newItems.splice(toIndex, 0, movedItem)
  
  items.value = newItems
  emit('update:modelValue', newItems)
  emit('reorder', { fromIndex, toIndex, items: newItems })
}

const removeItem = (index) => {
  const removedItem = items.value[index]
  const newItems = items.value.filter((_, i) => i !== index)
  
  items.value = newItems
  emit('update:modelValue', newItems)
  emit('item-remove', { index, item: removedItem, items: newItems })
}

const addItem = (item, index = -1) => {
  const newItems = [...items.value]
  if (index === -1) {
    newItems.push(item)
  } else {
    newItems.splice(index, 0, item)
  }
  
  items.value = newItems
  emit('update:modelValue', newItems)
}

const clearItems = () => {
  items.value = []
  emit('update:modelValue', [])
}

defineExpose({
  moveItem,
  removeItem,
  addItem,
  clearItems
})
</script>

<style scoped>
.sortable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sortable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: move;
}

.sortable-item:hover:not(.disabled) {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sortable-item.dragging {
  opacity: 0.5;
  background: #f3f4f6;
}

.sortable-item.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}

.sortable-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f9fafb;
}

.item-handle {
  color: #9ca3af;
  cursor: grab;
  user-select: none;
  font-weight: bold;
  padding: 4px;
}

.item-handle:active {
  cursor: grabbing;
}

.item-content {
  flex: 1;
  min-height: 20px;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sortable-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.action-btn.remove:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}
</style>
