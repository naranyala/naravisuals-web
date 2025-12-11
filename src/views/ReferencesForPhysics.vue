
<script setup>
import ReferencesList from "./references/ReferencesList.vue"
import { pdfList as physicsRelated } from "./references/physics-related.js"

</script>

<template>
  <ReferencesList :pdfList="physicsRelated"/>
</template>

<style scoped>
</style>
