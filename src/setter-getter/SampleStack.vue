<script setup>
import { useStack } from './useStack'

const history = useStack(['init'])
function save() { history.push(`save ${Date.now()}`) }
function undo() { history.pop() }
</script>

<template>
  <button @click="save">Save</button>
  <button @click="undo">Undo</button>
  <pre>{{ history.get() }}</pre>
  <p>Top: {{ history.top }}</p>
</template>
