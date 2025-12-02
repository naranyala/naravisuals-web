<template>
  <div class="color-picker">
    <button class="randomize-button" @click="randomizeColors">
      Randomize Colors
    </button>
    <div class="colors-grid">
      <div v-for="(color, index) in colors" :key="index" class="color-swatch" :style="{ backgroundColor: color }"
        @click="copyToClipboard(color)" :title="`Click to copy ${color}`">
        <span class="copy-feedback" v-if="copiedColor === color">
          Copied!
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const colors = ref([
  // Initial rich color palette
  '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
  '#33FFF3', '#8A2BE2', '#FF6347', '#7CFC00', '#FF4500',
  '#DA70D6', '#9932CC', '#FFD700', '#ADFF2F', '#FF1493',
  '#1E90FF', '#20B2AA', '#FF69B4', '#8B0000', '#48D1CC',
]);

const copiedColor = ref(null);

const copyToClipboard = (color) => {
  navigator.clipboard.writeText(color)
    .then(() => {
      copiedColor.value = color;
      setTimeout(() => {
        copiedColor.value = null;
      }, 1500);
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

const randomizeColors = () => {
  colors.value = Array.from({ length: 20 }, generateRandomColor);
};
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 300px;
  margin: 0 auto;
}

.randomize-button {
  padding: 8px 16px;
  background-color: #4a5568;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.randomize-button:hover {
  background-color: #2d3748;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.copy-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  animation: fadeInOut 1.5s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
