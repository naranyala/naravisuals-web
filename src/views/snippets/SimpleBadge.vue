
<template>
  <span :class="['badge', type]">{{ text }}</span>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  text: String,
  type: { type: String, default: 'default' } // default, success, error, warning
})
</script>

<style>
.badge { padding: 0.2rem 0.5rem; border-radius: 0.3rem; color: white; }
.badge.default { background: gray; }
.badge.success { background: green; }
.badge.error { background: red; }
.badge.warning { background: orange; }
</style>
