<template>
  <button @click="printPage" class="print-button">
  <!-- <button @click="togglePrintState" class="print-button"> -->
    print
  </button>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

import {isPrintAll} from "../../router.ts"

const props = defineProps(["isPrintAll"])


const printPage = () => {
  isPrintAll.value = !isPrintAll.value

  setTimeout(() => {
    window.print();
    isPrintAll.value = false;
  }, 3000)

};

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    printPage();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.print-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.print-button:hover {
  background-color: #2563eb;
}
</style>

