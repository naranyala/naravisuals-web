<template>
  <div class="dropdown-container" ref="dropdownRef">
    <button class="dropdown-toggle" @click="toggleDropdown" :class="{ 'dropdown-toggle--active': isOpen }">
      {{ selectedOption?.label || placeholder }}
      <span class="dropdown-arrow">▼</span>
    </button>
    <ul class="dropdown-menu" v-show="isOpen" :class="{ 'dropdown-menu--open': isOpen }">
      <li v-for="(option, index) in options" :key="index" class="dropdown-item" @click="selectOption(option)">
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const emit = defineEmits(['select']);

const isOpen = ref(false);
const selectedOption = ref(null);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  emit('select', option);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Dark theme styles */
.dropdown-container {
  position: relative;
  width: 200px;
  font-family: Arial, sans-serif;
}

.dropdown-toggle {
  width: 100%;
  padding: 10px 15px;
  background-color: #2d3748;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.dropdown-toggle:hover {
  background-color: #4a5568;
}

.dropdown-toggle--active {
  background-color: #4a5568;
}

.dropdown-arrow {
  margin-left: 10px;
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: #2d3748;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 15px;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #4a5568;
}
</style>
