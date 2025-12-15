<template>
  <div class="collapsible-container">
    <button 
      class="collapsible-header"
      @click="toggleCollapse"
      :aria-expanded="!isCollapsed"
      aria-controls="collapsible-content"
    >
      <span>{{ title }}</span>
      <span 
        class="arrow"
        :class="{ 'rotated': !isCollapsed }"
      >
        ▼
      </span>
    </button>
    
    <div 
      id="collapsible-content"
      class="collapsible-content"
      v-show="!isCollapsed"
    >
      <div class="content-wrapper">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Collapsible Section'
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["toggle-section"])

const isCollapsed = ref(props.isOpen);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  emit('toggle-section')
};
</script>

<style scoped>
/* Dark theme styles */
.collapsible-container {
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  background-color: #1e1e1e; /* dark background */
  color: #e0e0e0; /* light text */
}

.collapsible-header {
  width: 100%;
  padding: 1rem;
  text-align: left;
  background-color: #2a2a2a; /* slightly lighter dark */
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #e0e0e0;
  transition: background-color 0.3s ease;
}

.collapsible-header:hover {
  background-color: #3a3a3a; /* hover highlight */
}

.collapsible-header:focus {
  outline: 2px solid #00bfff; /* cyan accent focus */
}

.arrow {
  transition: transform 0.3s ease;
  color: #aaa; /* muted arrow */
}

.arrow.rotated {
  transform: rotate(180deg);
  color: #00bfff; /* accent when open */
}

.collapsible-content {
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #252525; /* inner background */
}

.content-wrapper {
  padding: 1rem;
  color: #ccc; /* softer text inside */
}
</style>
