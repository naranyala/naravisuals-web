<script setup>
import { useFocus } from './useFocus'
const focus = useFocus()
</script>

<template>
  <input ref="focus.el" @focus="focus.set(true)" @blur="focus.set(false)" />
  <button @click="focus.set(true)">Focus Input</button>

  <p>Focused: {{ focus.get() }}</p>
</template>
