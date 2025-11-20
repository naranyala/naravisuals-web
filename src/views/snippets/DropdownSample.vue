
<script setup>
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const selected = ref(null);
const isOpen = ref(false);

const selectOption = (option) => {
  selected.value = option;
  isOpen.value = false;
};
</script>

<template>
  <div class="dropdown">
    <button @click="isOpen = !isOpen">
      {{ selected || placeholder }}
    </button>
    <ul v-if="isOpen" class="dropdown-menu">
      <li v-for="(option, index) in options" :key="index" @click="selectOption(option)">
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  position: absolute;
  list-style: none;
  padding: 0;
  margin: 0;
  background: white;
  border: 1px solid #ccc;
  width: 100%;
}
.dropdown-menu li {
  padding: 0.5rem;
  cursor: pointer;
}
.dropdown-menu li:hover {
  background: #f0f0f0;
}
</style>
