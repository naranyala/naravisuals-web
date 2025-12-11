
<script setup>
import ReferencesList from "./references/ReferencesList.vue"
import { pdfList as mathRelated } from "./references/math-related.js"

</script>

<template>
  <ReferencesList :pdfList="mathRelated"/>
</template>

<style scoped>
</style>
