<template>
  <nav aria-label="Breadcrumb" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="breadcrumb-item"
      >
        <component
          :is="item.href ? 'a' : 'span'"
          :href="item.href"
          :class="['breadcrumb-link', { current: index === items.length - 1 }]"
          @click="!item.href && index !== items.length - 1 && $emit('item-click', item)"
        >
          {{ item.label }}
        </component>
        <span
          v-if="index < items.length - 1"
          class="breadcrumb-separator"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => items.every(item => item.id && item.label)
  },
  separator: {
    type: String,
    default: '/'
  }
})

defineEmits(['item-click'])
</script>

<style scoped>
.breadcrumb {
  padding: 12px 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  transition: color 0.2s ease;
  cursor: pointer;
}

.breadcrumb-link:hover:not(.current) {
  color: #3b82f6;
}

.breadcrumb-link.current {
  color: #374151;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-separator {
  color: #d1d5db;
  font-size: 14px;
  user-select: none;
}
</style>
