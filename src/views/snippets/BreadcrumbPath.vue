
<template>
  <nav class="breadcrumb">
    <ul>
      <li v-for="(item, i) in items" :key="i">
        <a v-if="i < items.length - 1" :href="item.href">{{ item.label }}</a>
        <span v-else>{{ item.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] }
})
</script>

<style scoped>
.breadcrumb ul { display: flex; gap: 0.5rem; list-style: none; }
.breadcrumb li::after { content: "/"; margin-left: 0.5rem; }
.breadcrumb li:last-child::after { content: ""; }
</style>
