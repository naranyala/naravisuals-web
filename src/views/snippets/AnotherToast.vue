
<template>
  <transition name="fade">
    <div v-if="show" class="toast">{{ message }}</div>
  </transition>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'

const props = defineProps({ message: String, duration: { type: Number, default: 3000 } })
const show = ref(true)

setTimeout(() => show.value = false, props.duration)
</script>

<style>
.toast { position: fixed; top: 1rem; right: 1rem; background: #333; color: #fff; padding: 0.5rem 1rem; border-radius: 0.3rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
