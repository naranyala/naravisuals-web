
<script setup>

import {ref, watch, onMounted} from "vue"
import CodeBlock from './reusables/CodeBlock.vue'

import Counter from "./grabn-go-content/Counter.vue"
import strCounter from "./grabn-go-content/Counter.vue?raw"

import DynamicStyling from "./grabn-go-content/DynamicStyling.vue"
import strDynamicStyling from "./grabn-go-content/DynamicStyling.vue?raw"

import strAccordion from "./grabn-go-content/Accordion.vue?raw"
import strAccordionUsage from "./grabn-go-content/AccordionUsage.vue?raw"
import AccordionUsage from "./grabn-go-content/AccordionUsage.vue"

import FullScreenModal from "./reusables/FullScreenModal.vue"

import strReactiveH from "./raw-files/reactive.h?raw"

const myComposables = ref([
  { isOpen: false, label: "Counter", codes: [strCounter] },
  { isOpen: false, label: "Dynamic Styling", codes: [strDynamicStyling] },
  { isOpen: false, label: "Accordion", codes: [
    { label: "Accordion Usage", code: strAccordionUsage },
    { label: "Accordion", code: strAccordion}, 
  ] },
])


</script>

<template>
  <div class="projects-container" @keydown="handleKeydown">
    <h1 class="section-title">COMPOSABLES</h1>
    <hr/> 

    <h2>REUSABLE VUE COMPONENTS</h2>

    <div class="group-container">
    <div v-for="item in myComposables" :key="item.label">
      <button @click="item.isOpen = true" style="margin: 10px;">{{item.label}}</button>

  <FullScreenModal v-model="item.isOpen">
        <div style="margin-top: 60px;">
        <h2>{{item.label}}</h2>

        <p style="margin: 20px 0; border: 1px solid gray; border-radius: 10px; padding: 10px;">lorem ipsum dolor</p>
           
            <div style="margin: 20px 0; text-align: center;">
            <div v-if="item.label == 'Counter'"><Counter/></div>
            <div v-if="item.label == 'Dynamic Styling'"><DynamicStyling/></div>
            <div v-if="item.label == 'Accordion'"><AccordionUsage/></div>
            </div>
            
            <div v-if="item.codes.length > 1">
              <CodeBlock v-for="(content, idx) in item.codes" :key="idx"
                language="js" :label="item.codes[idx]?.label"
                :code="item.codes[idx]?.code"
                style="margin: 20px;"/>
            </div>
            <div v-else>
              <CodeBlock language="js" :label="item.label" :code="item.codes[0]" style="margin: 20px 0;"/>
            </div>

        </div>
  </FullScreenModal>
    </div>
    </div>

  </div>
</template>

<style scoped>
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background-color: #121212;
  color: #fff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}


.group-container {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px 0;
}

</style>
