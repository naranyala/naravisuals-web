<script setup>
import { ref } from 'vue'

import IconPrinter from "../icons/IconPrinter.vue"
import IconToTop from "../icons/IconToTop.vue"

const buttons = ref([
  {
    id: 1,
    icon: 'scroll-to-top',
    color: 'gray',
    label: 'Scroll to Top'
  },
  {
    id: 2,
    icon: 'printer',
    color: 'gray',
    label: 'Print'
  },
])

const actionScrollToTop = () => {
  // 
}

const actionPrintAllPage = () => {
  // 
}

const emit = defineEmits(['action-scroll', 'action-print'])

const handleClick = (button) => {
  // console.log(button?.icon)
  switch(button?.icon){
    case "scroll-to-top": 
        console.log("scroll-to-top"); 
        // actionScrollToTop();
        emit('action-scroll');
        break;
    case "printer": 
        console.log("printer"); 
        // actionPrintAllPage();
        emit('action-print');
        break;
  }
}
</script>

<template>
  <div class="fab-container">
    <button
      v-for="button in buttons"
      :key="button.id"
      class="fab"
      :style="{ background: button.color }"
      @click="handleClick(button)"
      :aria-label="button.label"
    >
      <div v-if="button.icon == 'scroll-to-top'"><IconToTop/></div>
      <div v-if="button.icon == 'printer'"><IconPrinter/></div>
    </button>
  </div>
</template>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 50px;
  right: 45px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 24px;
  height: 24px;
  color: white;
  pointer-events: none;
}

@media (max-width: 640px) {
  .fab-container {
    bottom: 16px;
    right: 16px;
  }

  .fab {
    width: 52px;
    height: 52px;
  }
}
</style>
