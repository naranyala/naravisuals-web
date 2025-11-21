<template>
  <div>
    <button @click="scrollToBottom" class="scroll-btn">
      Scroll to Bottom
    </button>
  </div>
</template>

<script setup>
const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });
};
</script>

<style>
.scroll-btn {
  /* position: fixed; */
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
}

.scroll-btn:hover {
  background-color: #0056b3;
}

.content-item {
  padding: 20px;
  margin: 10px 0;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}
</style>
