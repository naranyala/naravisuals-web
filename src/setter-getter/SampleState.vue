<template>
  <div>
    <p>Count: {{ countState.get() }}</p>
    <button @click="increment">Increment</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup>
import { useState } from './useState'

const countState = useState(0)

function increment() {
  countState.set(countState.get() + 1)
}

function reset() {
  countState.reset()
}
</script>
