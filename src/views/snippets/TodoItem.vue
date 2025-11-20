<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  },
  index: Number
})

defineEmits(['toggle', 'remove'])
</script>

<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <input 
      type="checkbox" 
      :checked="todo.completed"
      @change="$emit('toggle', todo.id)"
    >
    <span>{{ todo.text }}</span>
    <button @click="$emit('remove', todo.id)" class="delete">×</button>
  </div>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
.completed span {
  text-decoration: line-through;
  opacity: 0.6;
}
.delete {
  margin-left: auto;
  background: #ff4444;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
