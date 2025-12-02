<template>
  <div class="dropdown">
    <select
      v-model="selectedIndex"
      @change="handleChange"
      class="dropdown-select"
    >
      <option
        v-for="(option, index) in options"
        :key="index"
        :value="index"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  defaultIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['select']);

const selectedIndex = ref(props.defaultIndex);

const handleChange = () => {
  emit('select', {
    index: selectedIndex.value,
    value: props.options[selectedIndex.value],
  });
};

// Update selectedIndex if defaultIndex prop changes
watch(() => props.defaultIndex, (newIndex) => {
  selectedIndex.value = newIndex;
});
</script>

<style scoped>
.dropdown-select {
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  width: 200px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dropdown-select:focus {
  outline: none;
  border-color: #63b3ed;
  box-shadow: 0 0 0 2px rgba(99, 179, 237, 0.3);
}

.dropdown-select option {
  background-color: #2d3748;
  color: #ffffff;
  padding: 8px;
}
</style>

