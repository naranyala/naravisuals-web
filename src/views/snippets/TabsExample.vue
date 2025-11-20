<template>
  <div class="tabs">
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  tabs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'tab-change'])

const localActiveTab = ref(props.modelValue || props.tabs[0]?.id)

const activeTab = computed({
  get: () => props.modelValue || localActiveTab.value,
  set: (value) => {
    localActiveTab.value = value
    emit('update:modelValue', value)
  }
})

const setActiveTab = (tabId) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
}
</script>

<style scoped>
.tabs {
  width: 100%;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: white;
}

.tabs-content {
  padding: 20px;
  background-color: white;
}
</style>
