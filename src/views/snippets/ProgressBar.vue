
<template>
  <div class="progress">
    <div class="bar" :style="{ width: percent + '%' }"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  percent: { type: Number, default: 0 }
})
</script>

<style scoped>
.progress { background: #eee; height: 10px; border-radius: 5px; }
.bar { background: #42b983; height: 100%; border-radius: 5px; transition: width 0.3s; }
</style>
