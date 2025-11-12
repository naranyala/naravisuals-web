<script setup>
import FaqPersonalContext from "./reusables/FaqPersonalContext.vue"
import FaqCreativeWork from "./reusables/FaqCreativeWork.vue"
import FaqProgrammingJourney from "./reusables/FaqProgrammingJourney.vue"
</script>

<template>
  <h2>Personal FAQ</h2>
  <FaqPersonalContext/>

  <h2>Creative Work FAQ</h2>
  <FaqCreativeWork/>

  <h2>Programming FAQ</h2>
  <FaqProgrammingJourney/>
</template>

<style scoped>
h2 { text-align: center; }
</style>
