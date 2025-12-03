<template>
  <div>
    <h3>Task Queue</h3>
    <ul>
      <li v-for="(task, index) in taskQueue.get()" :key="index">
        {{ task }}
      </li>
    </ul>
    <input v-model="newTask" @keyup.enter="addTask" />
    <button @click="processTask">Process Next Task</button>
    <button @click="clearAll">Clear All</button>
    <p>Next: {{ taskQueue.peek() }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQueue } from './useQueue'

const taskQueue = useQueue(['Task 1', 'Task 2'])
const newTask = ref('')

function addTask() {
  if (newTask.value.trim()) {
    taskQueue.enqueue(newTask.value)
    newTask.value = ''
  }
}

function processTask() {
  const task = taskQueue.dequeue()
  if (task) {
    alert(`Processing: ${task}`)
  }
}

function clearAll() {
  taskQueue.clear()
}
</script>
