
<template>
  <div class="progress-bar">
    <div class="progress" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ progress: { type: Number, default: 0 } })
</script>

<style>
.progress-bar { width: 100%; height: 0.5rem; background: #eee; border-radius: 0.25rem; overflow: hidden; }
.progress { height: 100%; background: green; transition: width 0.3s; }
</style>
