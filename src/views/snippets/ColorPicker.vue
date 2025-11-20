<script setup lang="ts">
const model = defineModel<string>({ default: '#3b82f6' })

const presets = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
</script>

<template>
  <div class="color-picker">
    <input type="color" v-model="model" class="native-picker" />
    <div class="presets">
      <button
        v-for="color in presets"
        :key="color"
        :style="{ background: color }"
        @click="model = color"
      />
    </div>
    <input type="text" v-model="model" placeholder="#hex or rgba()" />
  </div>
</template>

<style scoped>
.color-picker { display: flex; gap: 1rem; align-items: center; }
.native-picker { width: 60px; height: 60px; border: none; cursor: pointer; }
.presets button { width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
</style>
