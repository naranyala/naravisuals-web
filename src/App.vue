<script setup lang="ts">

import {ref} from "vue"

import { RouterLink, RouterView } from 'vue-router'

import WordRandomizer from "./WordRandomizer.vue"
import RunningTextBar from "./RunningTextBar.vue"
import SearchBar from "./SearchBar.vue"
import PhoneKeypad from "./PhoneKeypad.vue"
// import PrintAction from "./views/reusables/PrintAction.vue"
import SocialMediaLinks from "./views/reusables/SocialMediaLinks.vue"
import FloatingAction from "./views/reusables/FloatingAction.vue"

import { isPrintAll } from "./router.ts"

const msg = {
  someMotto: "CREATIVE COMPOUNDING",
  // someMotto: "LOW-LEVEL WIZARD WANNABE",
  socialContract: "mastering the industry, fulfill missing part of it"
}

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

    <RunningTextBar 
      direction="right"
      text="COMING SOON! WORK IN PROGRESS ..."
    />

  <RouterView />

    <!-- <RunningTextBar  -->
    <!--   direction="right" -->
    <!--   text="OPEN FOR WORK BTW ..." -->
    <!-- /> -->

  <div class="no-print">
  
    <!-- <PrintAction :isPrintAll="isPrintAll"/> -->


    <SocialMediaLinks/>

    <h2 class="message">{{msg.someMotto}}<br/>
      <small>{{msg.socialContract}}</small>
    </h2>

    <WordRandomizer/>

    <SearchBar/>

    <PhoneKeypad/>


    <FloatingAction
      @action-scroll="performScrolling"
      @action-print="performPrinting"
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
