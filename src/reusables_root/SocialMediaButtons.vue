<template>
  <div class="social-media-buttons">
    <a v-for="(button, index) in buttons" :key="index" :href="button.link" class="social-button" target="_blank"
      rel="noopener noreferrer">
      {{ button.label }}
    </a>
  </div>
</template>

<script setup>
const buttons = [
  { name: 'github', label: 'github', link: '?msg=github' },
  { name: 'x/twitter', label: 'x/twitter', link: '?msg=twitter' },
  { name: 'youtube', label: 'youtube', link: '?msg=youtube' },
];
</script>

<style scoped>
.social-media-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.social-button {
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #2d3748;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #4a5568;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
