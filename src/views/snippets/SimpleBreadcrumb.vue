<script setup lang="ts">
defineProps<{
  items: { label: string; to?: string | object }[]
}>()
const router = useRouter()
</script>

<template>
  <nav class="breadcrumb">
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <component 
          :is="item.to ? 'router-link' : 'span'"
          :to="item.to"
          class="breadcrumb-item"
          :class="{ active: i === items.length - 1 }"
        >
          {{ item.label }}
        </component>
        <span v-if="i < items.length - 1" class="separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb ol { display: flex; list-style: none; padding: 0; margin: 0; }
.breadcrumb-item { color: #6b7280; }
.breadcrumb-item.active { color: #1f2937; font-weight: 600; }
.separator { margin: 0 0.5rem; color: #9ca3af; }
</style>
