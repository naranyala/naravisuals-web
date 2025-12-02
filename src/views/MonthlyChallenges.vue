<script setup>
import ThirtyDaysCBasics from "./challenges/ThirtyDaysCBasics.vue"
import ThirtyDaysCAdvanced from "./challenges/ThirtyDaysCAdvanced.vue"
// import ThirtyDaysRustBasics from "./challenges/ThirtyDaysRustBasics.vue"
// import ThirtyDaysRustAdvanced from "./challenges/ThirtyDaysRustAdvanced.vue"

import ThirtyDaysVlangBasics from "./challenges/ThirtyDaysVlangBasics.vue"
import ThirtyDaysVlangAdvanced from "./challenges/ThirtyDaysVlangAdvanced.vue"

</script>

<template>
  <h1>CHALLENGES</h1>
  <hr />

  <ThirtyDaysCBasics />
  <ThirtyDaysCAdvanced />
  <!-- <ThirtyDaysRustBasics /> -->
  <!-- <ThirtyDaysRustAdvanced /> -->

  <ThirtyDaysVlangBasics />
  <ThirtyDaysVlangAdvanced />

</template>

<style scoped>
h1,
h2,
h3 {
  color: white;
}
</style>
