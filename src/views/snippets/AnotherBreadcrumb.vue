
<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <nav class="breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="index">
        <a v-if="item.link" :href="item.link">{{ item.text }}</a>
        <span v-else>{{ item.text }}</span>
        <span v-if="index < items.length - 1"> / </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb ol {
  list-style: none;
  padding: 0;
  display: flex;
}
.breadcrumb li {
  margin: 0 0.25rem;
}
</style>
