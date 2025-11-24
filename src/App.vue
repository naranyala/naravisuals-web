<script setup lang="ts">

import {ref} from "vue"

import { RouterLink, RouterView } from 'vue-router'


import CommandCenter from "./CommandCenter.vue"
import RunningTextBar from "./RunningTextBar.vue"
import MinimalFooter from "./MinimalFooter.vue"

import { isPrintAll } from "./router.ts"


const performScrolling = () => {
  console.log("perform scrolling");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const performPrinting = () => {
  // console.log("perform print page");
  printPage()
}


import { onMounted, onBeforeUnmount } from 'vue';

import {isPrintAll} from "./router.ts"

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

<template>
  <RunningTextBar direction="right" text="COMING SOON! WORK IN PROGRESS ..."/>
  <CommandCenter/>
  <RouterView />

  <div class="no-print">

      <MinimalFooter/>
  </div>

</template>

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
