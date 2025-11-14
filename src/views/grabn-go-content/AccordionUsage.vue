
<template>
  <Accordion
    :items="accordionItems"
    :defaultOpen="0"
  >
    <template #content-0>
      <p>Custom content for the first item!</p>
    </template>
  </Accordion>
</template>

<script setup>
import Accordion from './Accordion.vue';

const accordionItems = [
  { title: 'Section 1', content: 'Default content for section 1' },
  { title: 'Section 2', content: 'Default content for section 2' },
  { title: 'Section 3', content: 'Default content for section 3' },
];
</script>
