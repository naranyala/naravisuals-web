<script setup>


import PageHeader from "./goober-motion/PageHeader.jsx"
import GeneralCodeblockTabs from "./explore-code/GeneralCodeblockTabs.vue"

import GeneralReferences from "./reusables/GeneralReferences.vue"

import { topics as topics01 } from "./explore-code/moderncss-examples-1.js"
import { topics as topics02 } from "./explore-code/moderncss-examples-2.js"
import { topics as topics03 } from "./explore-code/moderncss-examples-3.js"
import { topics as topics04 } from "./explore-code/moderncss-examples-4.js"

</script>

<template>
  <PageHeader title="Modern CSS" subtitle="your every day css support"/>

  <GeneralCodeblockTabs :topics="topics01" :isTitleVisible="true" title="Modern CSS" />
  <GeneralCodeblockTabs :topics="topics02" />
  <GeneralCodeblockTabs :topics="topics03" />
  <GeneralCodeblockTabs :topics="topics04" />

  <GeneralReferences/>
</template>
