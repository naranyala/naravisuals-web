
<template>
  <div>
    <div @click="open = !open" style="cursor:pointer; font-weight:bold">
      <slot name="title"></slot>
    </div>
    <div v-show="open">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
