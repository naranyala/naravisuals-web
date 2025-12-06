<script setup>

import PageHeader from "../goober-motion/PageHeader.jsx"
  import GeneralCodeblockTabs from "./GeneralCodeblockTabs.vue"

import { topics as topics01 } from "./modernjs-examples-1.js"
import { topics as topics02 } from "./modernjs-examples-2.js"
import { topics as topics03 } from "./modernjs-examples-3.js"
import { topics as topics04 } from "./modernjs-examples-4.js"

</script>

<template>
  <PageHeader title="Modern Javascript"/>

  <GeneralCodeblockTabs :topics="topics01" :isTitleVisible="true" title="Modern Javascript" />
  <GeneralCodeblockTabs :topics="topics02" />
  <GeneralCodeblockTabs :topics="topics03" />
  <GeneralCodeblockTabs :topics="topics04" />
</template>
