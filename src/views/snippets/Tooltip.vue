
<template>
  <div class="tooltip-wrapper">
    <slot></slot>
    <span class="tooltip">{{ text }}</span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ text: String })
</script>

<style>
.tooltip-wrapper { position: relative; display: inline-block; cursor: pointer; }
.tooltip { visibility: hidden; background: black; color: white; padding: 0.3rem 0.5rem; border-radius: 0.2rem; position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.tooltip-wrapper:hover .tooltip { visibility: visible; }
</style>
