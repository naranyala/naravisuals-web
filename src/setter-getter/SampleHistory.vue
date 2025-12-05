<script setup>
import { useHistory } from './useHistory'

const text = useHistory('')
</script>

<template>
  <input v-model="text.present" @input="text.set($event.target.value)" />

  <button @click="text.undo()">Undo</button>
  <button @click="text.redo()">Redo</button>

  <p>Current: {{ text.get() }}</p>
</template>
