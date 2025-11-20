
<script setup>
import { ref } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
});

const activeTab = ref(0);
</script>

<template>
  <div class="tabs">
    <div class="tabs-header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :class="{ active: activeTab === index }"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="tabs-content">
      <slot :name="tabs[activeTab].name"></slot>
    </div>
  </div>
</template>

<style scoped>
.tabs-header {
  display: flex;
  border-bottom: 1px solid #ccc;
}
.tabs-header button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: none;
  background: none;
}
.tabs-header button.active {
  border-bottom: 2px solid blue;
}
</style>
