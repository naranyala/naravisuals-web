<script setup>
import { useSet } from './useSet'

const tags = useSet(['vue', 'js'])
</script>

<template>
  <p>{{ [...tags.get()].join(', ') }}</p>
  <button @click="tags.add('composition')">Add</button>
  <button @click="tags.remove('js')">Remove JS</button>
</template>
