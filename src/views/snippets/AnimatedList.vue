
<template>
  <transition-group name="fade" tag="ul">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </transition-group>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ items: Array })
</script>

<style>
.fade-enter-active { transition: all 0.3s ease; }
.fade-leave-active { transition: all 0.3s ease; opacity: 0; transform: translateY(-10px); }
.fade-enter-from { opacity: 0; transform: translateY(-10px); }
</style>
