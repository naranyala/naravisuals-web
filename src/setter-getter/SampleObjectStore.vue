<script setup>
import { useObjectStore } from './useObjectStore'

const profile = useObjectStore({
  name: 'Fudzer',
  age: 25
})

function updateAge() {
  profile.patch({ age: profile.get().age + 1 })
}
</script>

<template>
  <div>{{ profile.get().name }} — {{ profile.get().age }}</div>
  <button @click="updateAge">+ Age</button>
</template>
