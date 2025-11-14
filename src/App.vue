<script setup lang="ts">

import {ref} from "vue"

import { RouterLink, RouterView } from 'vue-router'

import StickyBottomBar from "./StickyBottomBar.vue"
import SearchBar from "./SearchBar.vue"

// import PrintAction from "./views/reusables/PrintAction.vue"
import SocialMediaLinks from "./views/reusables/SocialMediaLinks.vue"
import FloatingAction from "./views/reusables/FloatingAction.vue"

import { isPrintAll } from "./router.ts"

const someMotto = ref(
    // "TOTALITAS & SISTEMATIS"
    // "VISIBLE & SUSTAINABLE"
    // "SOLID & CREATIVE"
   "CREATIVE COMPOUNDING" 
)

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
  <RouterView />

    <!-- <StickyBottomBar  -->
    <!--   direction="right" -->
    <!--   text="OPEN FOR WORK BTW ..." -->
    <!-- /> -->

  <div class="no-print">
  
    <!-- <PrintAction :isPrintAll="isPrintAll"/> -->

  <h2 class="message">
    <!-- <small>semoga</small> -->
    <br/>
      {{someMotto}}
  </h2>

    <SocialMediaLinks/>

    <SearchBar/>

    <FloatingAction
      @action-scroll="performScrolling"
      @action-print="performPrinting"
    />

    <StickyBottomBar 
      direction="right"
      text="COMING SOON! WORK IN PROGRESS ..."
    />
  </div>
</template>

<style scoped>

small, h2 { text-align: center; font-style: italic; padding-bottom: 200px;
  background: rgba(0 0 0 0); text: white; }

.message { padding-top: 200px; }


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
