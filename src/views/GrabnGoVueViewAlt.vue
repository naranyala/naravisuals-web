
<script setup>
import {ref, onMounted} from "vue"

import CodeBlock from './reusables/CodeBlock.vue'
// import RenderMarkdownStr from "./reusables/RenderMarkdown.vue?raw"
import SlidingUpDrawer from "./reusables/SlidingUpDrawer.vue"

import Counter from "./grabn-go-content/Counter.vue"
import strCounter from "./grabn-go-content/Counter.vue?raw"


import strAccordion from "./grabn-go-content/Accordion.vue?raw"
import strAccordionUsage from "./grabn-go-content/AccordionUsage.vue?raw"

</script>

<template>
  <div class="demo">

    <SlidingUpDrawer/>

    <div class="codeblock-container">
      <CodeBlock language="js" :code="strAccordion"
        label="Accordion.vue" />
    </div>


    <div class="codeblock-container">
      <CodeBlock language="js" :code="strAccordionUsage"
        label="AccordionUsage.vue" />
    </div>

    <hr/>

    <div class="codeblock-container">
       <CodeBlock language="js" :code="strCounter" label="Counter.vue"/>
      <Counter/>
    </div>

  </div>
</template>

<style scoped>
.codeblock-container { 
  margin: 20px 0 20px 0; 
  padding: 20px 0 20px 0;
  /* border: 1px solid gray; */
  /* border-radius: 10px; */

  div { margin: 20px 0; }
}
</style>
