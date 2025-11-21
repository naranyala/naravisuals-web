<template>
  <div>

    <!-- Scroll to top button -->
    <button 
      v-show="showScrollButton" 
      @click="scrollToTop" 
      class="scroll-btn"
    >
      Scroll to Top
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showScrollButton = ref(false);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const handleScroll = () => {
  // Show button when scrolled down more than 200px
  showScrollButton.value = window.scrollY > 200;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
.scroll-btn {
  /* position: fixed; */
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
  transition: opacity 0.3s;
}

.scroll-btn:hover {
  background-color: #218838;
}

.content-item {
  padding: 20px;
  margin: 10px 0;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}
</style>
