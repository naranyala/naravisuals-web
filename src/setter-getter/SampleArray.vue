<template>
  <div>
    <ul>
      <li v-for="(item, index) in todoList.get()" :key="index">
        {{ item }}
        <button @click="removeTodo(index)">Remove</button>
      </li>
    </ul>
    <input v-model="newTodo" @keyup.enter="addTodo" />
    <button @click="clearAll">Clear All</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useArray } from './useArray'

const todoList = useArray(['Learn Vue', 'Build project'])
const newTodo = ref('')

function addTodo() {
  if (newTodo.value.trim()) {
    todoList.push(newTodo.value)
    newTodo.value = ''
  }
}

function removeTodo(index) {
  todoList.remove(index)
}

function clearAll() {
  todoList.clear()
}
</script>
