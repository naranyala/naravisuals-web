
<script setup>
import { ref } from 'vue';

const props = defineProps({
  sections: {
    type: Array,
    required: true,
  },
});

const activeSection = ref(null);
</script>

<template>
  <div class="accordion">
    <div v-for="(section, index) in sections" :key="index" class="accordion-section">
      <button @click="activeSection = activeSection === index ? null : index">
        {{ section.title }}
      </button>
      <div v-if="activeSection === index" class="accordion-content">
        <slot :name="section.name"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-section {
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
}
.accordion-section button {
  width: 100%;
  padding: 0.5rem;
  text-align: left;
  cursor: pointer;
}
.accordion-content {
  padding: 0.5rem;
}
</style>
