<script setup>
import { useQueryParam } from './useQueryParam'

const { value: category } = useQueryParam('category', 'all')
</script>

<template>
  <div>
    <select v-model="category">
      <option value="all">All</option>
      <option value="tech">Tech</option>
      <option value="news">News</option>
    </select>
    <!-- URL becomes /?category=tech -->
  </div>
</template>
