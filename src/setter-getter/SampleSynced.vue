<!-- NavBar.vue -->
<script setup>
import { useSynced } from '~/composables/useSynced'
const banner = useSynced('banner', 'Hello')
</script>
<template>
  <input v-model="banner.value">
</template>

<!-- Footer.vue -->
<!-- <script setup> -->
<!-- import { useSynced } from '~/composables/useSynced' -->
<!-- const banner = useSynced('banner', 'Hello') -->
<!-- </script> -->
<!-- <template> -->
<!--   <p>{{ banner.get() }}</p> -->
<!-- </template> -->
