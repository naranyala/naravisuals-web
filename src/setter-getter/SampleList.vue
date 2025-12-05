<script setup>
import { useList } from './useList'

const tasks = useList(['eat', 'code', 'sleep'])
</script>

<template>
  <div>
    <ul>
      <li v-for="(t, i) in tasks.get()">{{ t }}</li>
    </ul>
    <button @click="tasks.push('repeat')">Add</button>
  </div>
</template>
