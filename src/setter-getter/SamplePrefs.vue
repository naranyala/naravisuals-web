<!-- ComponentA.vue -->
<script setup>
import { usePrefs } from '~/composables/usePrefs'
const theme = usePrefs('theme', 'light')
</script>
<template>
  <select v-model="theme.value">
    <option>light</option>
    <option>dark</option>
  </select>
</template>

<!-- ComponentB.vue -->
<!-- <script setup> -->
<!-- import { usePrefs } from '~/composables/usePrefs' -->
<!-- const theme = usePrefs('theme', 'light') -->
<!-- </script> -->
<!-- <template> -->
<!--   <h1 :class="theme.get()">Hello {{ theme.value }} world</h1> -->
<!-- </template> -->
