<template>
  <div 
    class="scroll-progress-container"
    :style="{ width: `${scrollPercentage}%` }"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const scrollPercentage = ref(0);

const updateScrollProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollPercentage.value = (scrollTop / scrollHeight) * 100;
};

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress);
});
</script>

<style scoped>
.scroll-progress-container {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(to right, #007bff, #00aaff);
  z-index: 9999;
  transition: width 0.05s ease;
  transform-origin: 0% 0%;
}
</style>
