<script setup>
import { useSessionStorage } from './useSessionStorage'

const { value: draft } = useSessionStorage('post-draft', '')
</script>

<template>
  <textarea v-model="draft" placeholder="Your draft (cleared when tab closes)"></textarea>
</template>
