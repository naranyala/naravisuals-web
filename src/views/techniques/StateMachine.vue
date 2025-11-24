
<template>
  <div class="state-machine">
    <h2>Current State: {{ state }}</h2>

    <div v-if="state === 'idle'">
      <button @click="transition('start')">Start Loading</button>
    </div>

    <div v-else-if="state === 'loading'">
      <p>Loading...</p>
      <button @click="transition('finish')">Finish</button>
      <button @click="transition('reset')">Reset</button>
    </div>

    <div v-else-if="state === 'success'">
      <p>✅ Success!</p>
      <button @click="transition('reset')">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Define states
const states = {
  idle: { start: 'loading' },
  loading: { finish: 'success', reset: 'idle' },
  success: { reset: 'idle' }
}

// Current state
const state = ref('idle')

// Transition function
function transition(action) {
  const next = states[state.value]?.[action]
  if (next) {
    state.value = next
  } else {
    console.warn(`Invalid transition: ${state.value} -> ${action}`)
  }
}
</script>

<style scoped>
.state-machine {
  font-family: sans-serif;
  padding: 1rem;
}
button {
  margin: 0.25rem;
}
</style>
