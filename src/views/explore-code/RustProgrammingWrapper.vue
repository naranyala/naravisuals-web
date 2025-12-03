<script setup>
import ExploreRustCode from "./ExploreRustCode.vue"

import { topics as topics01 } from "./rust-examples-1.js"
import { topics as topics02 } from "./rust-examples-2.js"
import { topics as topics03 } from "./rust-examples-3.js"

</script>

<template>
  <ExploreRustCode :topics="topics01" :isTitleVisible="true" />
  <ExploreRustCode :topics="topics02" />
  <ExploreRustCode :topics="topics03" />
</template>
