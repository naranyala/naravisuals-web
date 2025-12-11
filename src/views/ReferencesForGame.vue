
<script setup>
import ReferencesList from "./references/ReferencesList.vue"
import { pdfList as gameRelated } from "./references/game-related.js"

</script>

<template>
  <ReferencesList :pdfList="gameRelated"/>
</template>

<style scoped>
</style>
