<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  tabs: { label: string; value: string | number; icon?: string }[]
}>()

const emit = defineEmits(['update:modelValue'])

const selectTab = (value: string | number) => emit('update:modelValue', value)
</script>

<template>
  <div class="tabs">
    <div class="tab-list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :class="{ active: modelValue === tab.value }"
        @click="selectTab(tab.value)"
      >
        <span v-if="tab.icon" class="icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tab-list {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.tab-list button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  position: relative;
}
.tab-list button.active {
  color: #3b82f6;
}
.tab-list button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #3b82f6;
  border-radius: 3px 3px 0 0;
}
</style>
