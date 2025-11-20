<template>
  <div class="accordion">
    <div
      v-for="item in items"
      :key="item.id"
      class="accordion-item"
    >
      <button
        :class="['accordion-header', { active: activeItem === item.id }]"
        @click="toggleItem(item.id)"
      >
        <span class="accordion-title">{{ item.title }}</span>
        <span class="accordion-icon">{{ activeItem === item.id ? '−' : '+' }}</span>
      </button>
      <transition
        name="accordion"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
      >
        <div
          v-show="activeItem === item.id"
          class="accordion-content"
        >
          <div class="accordion-body">
            <slot :name="`content-${item.id}`" :item="item">
              {{ item.content }}
            </slot>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => items.every(item => item.id && item.title)
  },
  multiple: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [String, Array],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'item-toggle'])

const activeItem = ref(props.modelValue || (props.multiple ? [] : null))

const toggleItem = (itemId) => {
  if (props.multiple) {
    const currentItems = Array.isArray(activeItem.value) ? activeItem.value : []
    const newItems = currentItems.includes(itemId)
      ? currentItems.filter(id => id !== itemId)
      : [...currentItems, itemId]
    
    activeItem.value = newItems
    emit('update:modelValue', newItems)
    emit('item-toggle', { itemId, action: currentItems.includes(itemId) ? 'close' : 'open' })
  } else {
    const newValue = activeItem.value === itemId ? null : itemId
    activeItem.value = newValue
    emit('update:modelValue', newValue)
    emit('item-toggle', { itemId, action: newValue === itemId ? 'open' : 'close' })
  }
}

// Animation helpers
const onEnter = (el) => {
  el.style.height = '0'
  el.offsetHeight // Trigger reflow
  el.style.height = el.scrollHeight + 'px'
}

const onAfterEnter = (el) => {
  el.style.height = 'auto'
}

const onLeave = (el) => {
  el.style.height = el.scrollHeight + 'px'
  el.offsetHeight // Trigger reflow
  el.style.height = '0'
}
</script>

<style scoped>
.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background-color: #f9fafb;
}

.accordion-header.active {
  background-color: #f0f9ff;
  border-bottom: 1px solid #e5e7eb;
}

.accordion-title {
  font-weight: 500;
  color: #374151;
}

.accordion-icon {
  font-weight: bold;
  color: #6b7280;
  font-size: 18px;
}

.accordion-content {
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion-body {
  padding: 20px;
  background-color: white;
  color: #6b7280;
  line-height: 1.6;
}
</style>
