<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import StickyBottomBar from "./views/StickyBottomBar.vue"

</script>

<template>
  <RouterView />

    <!-- <StickyBottomBar  -->
    <!--   direction="right" -->
    <!--   text="OPEN FOR WORK BTW ..." -->
    <!-- /> -->

  <div class="no-print">
  <h2>
    <small>semoga</small>
    <br/>
    TOTALITAS & SISTEMATIS
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

</style>
