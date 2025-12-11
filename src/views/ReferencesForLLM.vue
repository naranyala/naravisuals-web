<script setup>
import ReferencesList from "./references/ReferencesList.vue"
import { pdfList as llmRelated } from "./references/llm-related.js"

</script>

<template>
  <ReferencesList :pdfList="llmRelated"/>
</template>

<style scoped>
</style>
