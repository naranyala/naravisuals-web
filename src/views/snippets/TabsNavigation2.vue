
<template>
  <div>
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="{ active: tab === activeTab }">{{ tab }}</button>
    </div>
    <div class="tab-content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({ tabs: { type: Array, default: () => [] } })
const activeTab = ref(props.tabs[0] || '')
</script>

<style>
.tabs button.active { font-weight: bold; }
</style>
