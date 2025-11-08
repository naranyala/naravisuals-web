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


    <StickyBottomBar 
      direction="right"
      text="COMING SOON! WORK IN PROGRESS ..."
    />

</template>

<style scoped>
</style>
