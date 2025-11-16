
<template>
  <div class="faq-list">
    <FAQItem
      v-for="(item, index) in items"
      :key="index"
      :item="item"
    />
  </div>
</template>

<script setup>
import FAQItem from "./FAQItem.vue"

defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
