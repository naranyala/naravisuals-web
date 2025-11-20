
<template>
  <button :disabled="loading">
    <span v-if="loading">Loading...</span>
    <span v-else><slot></slot></span>
  </button>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false }
})
</script>
