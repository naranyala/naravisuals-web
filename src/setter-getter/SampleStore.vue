<template>
  <div>
    <h3>Store Manager</h3>
    <p>Count: {{ count }}</p>
    <p>User: {{ user.name }} ({{ user.age }})</p>

    <button @click="increment">Increment</button>
    <button @click="updateUser">Update User</button>
    <button @click="store.undo()" :disabled="store.getHistory().length <= 1">
      Undo
    </button>
    <button @click="store.reset()">Reset</button>

    <div class="history">
      <h4>History ({{ store.getHistory().length }})</h4>
      <div v-for="(snapshot, idx) in store.getHistory().slice(-3)" :key="idx">
        #{{ idx }}: {{ JSON.stringify(snapshot) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from './useStore'

const store = useStore({
  count: 0,
  user: {
    name: 'John',
    age: 30
  }
})

// Destructure reactive state
const { count, user } = store

const increment = store.createAction((state) => {
  state.count++
})

const updateUser = store.createAction((state) => {
  state.user.age++
  state.user.name = `User ${state.count}`
})

// Subscribe to changes
store.subscribe('count', (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})
</script>
