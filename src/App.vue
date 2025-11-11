<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import StickyBottomBar from "./views/reusables/StickyBottomBar.vue"
// import PrintAction from "./views/reusables/PrintAction.vue"

import { isPrintAll } from "./router.ts"

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
    <small>semoga</small>
    <br/>
    <!-- TOTALITAS & SISTEMATIS -->
    VISIBLE & SUSTAINABLE
  </h2>


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

</style>
