<script setup>
import VlangProgramming from "./VlangProgramming.vue"

import { topics as topics01 } from "./vlang-examples-1.js"
import { topics as topics02 } from "./vlang-examples-2.js"
import { topics as topics03 } from "./vlang-examples-3.js"

</script>

<template>
  <VlangProgramming :topics="topics01" :isTitleVisible="true" />
  <VlangProgramming :topics="topics02" />
  <VlangProgramming :topics="topics03" />
</template>
