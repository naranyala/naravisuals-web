<template>
  <div class="searchable-select" ref="selectContainer">
    <!-- Selected Value Display -->
    <div
      class="select-trigger"
      :class="{
        open: isOpen,
        disabled: disabled,
        'has-error': error
      }"
      @click="toggleDropdown"
    >
      <div class="selected-value">
        <span v-if="selectedOption">
          {{ selectedOption[labelKey] }}
        </span>
        <span v-else class="placeholder">
          {{ placeholder }}
        </span>
      </div>
      <div class="select-arrow">
        {{ isOpen ? '▲' : '▼' }}
      </div>
    </div>

    <!-- Dropdown -->
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="select-dropdown"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="search-box">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
            @input="onSearch"
          />
        </div>

        <!-- Options List -->
        <div class="options-list">
          <div
            v-for="option in filteredOptions"
            :key="option[valueKey]"
            :class="['option-item', { selected: isOptionSelected(option) }]"
            @click="selectOption(option)"
          >
            <slot name="option" :option="option">
              {{ option[labelKey] }}
            </slot>
          </div>

          <div v-if="filteredOptions.length === 0" class="no-options">
            {{ noOptionsText }}
          </div>
        </div>
      </div>
    </transition>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  noOptionsText: {
    type: String,
    default: 'No options found'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'search'])

const isOpen = ref(false)
const searchQuery = ref('')
const selectContainer = ref(null)
const searchInput = ref(null)

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  
  if (typeof props.modelValue === 'object') {
    return props.modelValue
  }
  
  return props.options.find(option => option[props.valueKey] === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => 
    option[props.labelKey].toLowerCase().includes(query)
  )
})

const isOptionSelected = (option) => {
  if (!props.modelValue) return false
  
  if (typeof props.modelValue === 'object') {
    return props.modelValue[props.valueKey] === option[props.valueKey]
  }
  
  return props.modelValue === option[props.valueKey]
}

const toggleDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = !isOpen.value
  if (isOpen.value && props.searchable) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
}

const selectOption = (option) => {
  const value = props.valueKey ? option[props.valueKey] : option
  emit('update:modelValue', value)
  emit('change', option)
  isOpen.value = false
  searchQuery.value = ''
}

const onSearch = () => {
  emit('search', searchQuery.value)
}

const handleClickOutside = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 42px;
}

.select-trigger:hover:not(.disabled) {
  border-color: #9ca3af;
}

.select-trigger.open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-trigger.disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-trigger.has-error {
  border-color: #ef4444;
}

.selected-value {
  flex: 1;
  text-align: left;
}

.placeholder {
  color: #9ca3af;
}

.select-arrow {
  color: #6b7280;
  font-size: 12px;
  margin-left: 8px;
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
  margin-top: 4px;
  overflow: hidden;
}

.search-box {
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f9fafb;
}

.option-item:hover {
  background-color: #f3f4f6;
}

.option-item.selected {
  background-color: #eff6ff;
  color: #1e40af;
  font-weight: 500;
}

.option-item:last-child {
  border-bottom: none;
}

.no-options {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
}

/* Dropdown Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
