
<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const wrapper = ref(null)

function handleClickOutside(event) {
  if (wrapper.value && !wrapper.value.contains(event.target)) {
    wrapper.value.dispatchEvent(new CustomEvent('click-outside'))
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
