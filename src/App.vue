<script setup lang="ts">

import { ref } from "./reusables_rootue"

import { RouterLink, RouterView } from 'vue-router'

import CommandCenter from "./reusables_root/CommandCenter.vue"
import RunningTextBar from "./reusables_root/RunningTextBar.vue"
import MinimalFooter from "./reusables_root/MinimalFooter.vue"

import WelcomeMenu from "./reusables_root/WelcomeMenu.vue"

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
  <RunningTextBar direction="right" text="COMING SOON! WORK IN PROGRESS ..." />
  <CommandCenter />

  <RouterView />

  <div class="no-print">
    <!-- <WelcomeMenu/> -->
    <MinimalFooter />
  </div>

</template>

<style scoped>
body {
  height: 100vh;
  padding: 0;
}

#app {
  height: 100vh;
  padding: 0;
}

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
