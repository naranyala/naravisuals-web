<script setup>
import { useToggleGroup } from './useToggleGroup'

const { createToggle } = useToggleGroup(['panel1', 'panel2', 'panel3'], true)

const panel1 = createToggle('panel1')
const panel2 = createToggle('panel2')
// Each is a writable computed: true/false
</script>

<template>
  <div>
    <button @click="panel1 = !panel1">Toggle Panel 1</button>
    <div v-show="panel1">Content 1</div>

    <button @click="panel2 = !panel2">Toggle Panel 2</button>
    <div v-show="panel2">Content 2</div>
  </div>
</template>
