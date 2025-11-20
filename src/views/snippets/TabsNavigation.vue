
<template>
  <div>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: tab === active }"
        @click="active = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div class="content">
      <slot :active="active" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabs: { type: Array, default: () => [] }
})

const active = ref(props.tabs[0] || null)
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; }
button.active { font-weight: bold; border-bottom: 2px solid #42b983; }
</style>
