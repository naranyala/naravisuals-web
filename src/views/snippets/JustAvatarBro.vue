
<template>
  <div class="avatar">
    <img v-if="src" :src="src" :alt="alt" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ src: String, alt: String, name: String })
const initials = computed(() => props.name?.split(' ').map(n => n[0]).join('').toUpperCase())
</script>

<style>
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #ccc; display: flex; justify-content: center; align-items: center; overflow: hidden; font-weight: bold; color: white; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
