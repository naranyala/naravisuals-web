<script setup>
import ExploreCProgramming from "./ExploreCProgramming.vue"

import { topics as topics01 } from "./c99-examples-1.js"
import { topics as topics02 } from "./c99-examples-2.js"
import { topics as topics03 } from "./c99-examples-3.js"

</script>

<template>
  <ExploreCProgramming :topics="topics01" :isTitleVisible="true" />
  <ExploreCProgramming :topics="topics02" />
  <ExploreCProgramming :topics="topics03" />
</template>
