<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import StickyBottomBar from "./views/StickyBottomBar.vue"

</script>

<template>
  <RouterView />

    <StickyBottomBar 
      direction="right"
      text="OPEN FOR WORK BTW ..."
    />

</template>

<style scoped>
</style>
