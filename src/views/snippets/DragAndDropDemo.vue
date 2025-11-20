
<script setup>
import { ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:items']);

const dragIndex = ref(null);

const onDragStart = (index) => {
  dragIndex.value = index;
};

const onDrop = (dropIndex) => {
  if (dragIndex.value === null) return;
  const newItems = [...props.items];
  const [removed] = newItems.splice(dragIndex.value, 1);
  newItems.splice(dropIndex, 0, removed);
  emit('update:items', newItems);
  dragIndex.value = null;
};
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="index"
      draggable="true"
      @dragstart="onDragStart(index)"
      @dragover.prevent
      @drop="onDrop(index)"
    >
      {{ item }}
    </li>
  </ul>
</template>
