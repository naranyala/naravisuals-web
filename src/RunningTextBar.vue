
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// import PrintAction from "./PrintAction.vue"

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 20 },
  theme: { type: String, default: 'dark' },
  height: { type: String, default: '30px' }
});

const reps = ref(3);
const track = ref(null);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const newButtonAction = () => {
  // Replace with your custom logic
  alert('New button clicked!');
};

const updateReps = () => {
  const singleText = track.value?.firstElementChild;
  if (singleText) {
    reps.value = Math.max(3, Math.ceil(window.innerWidth * 2 / singleText.scrollWidth));
  }
};

onMounted(() => {
  updateReps();
  window.addEventListener('resize', updateReps);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateReps);
});
</script>


<template>
  <div class="sticky-bar" :class="`theme-${theme}`" :style="{ height }">
    <div class="track" ref="track" :style="{ animationDuration: `${speed}s` }">
      <span class="text"><slot>{{ text }}</slot></span>
      <span v-for="i in reps - 1" :key="i" class="text duplicate"><slot>{{ text }}</slot></span>
    </div>
    <div class="buttons-container">
      <!-- <button class="top-btn" @click="scrollToTop">Scroll to Top</button> -->
      <!-- New button -->
      <!-- <button class="new-btn" @click="newButtonAction">New Action</button> -->
      <!-- <PrintAction class="new-btn"/> -->
    </div>
  </div>
</template>

<style scoped>
.sticky-bar {
  /* border-top: 1px solid lightgray; */
  border-bottom: 1px solid lightgray;
  /* position: fixed; */
  position: sticky;
  top: 0;
  /* bottom: 0; */
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: #fff;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: v-bind(height);
}
.theme-light {
  background: #f5f5f5;
  color: #333;
}
.track {
  display: flex;
  align-items: center;
  flex: 1;
  animation: scroll-rtl linear infinite;
  will-change: transform;
  padding-right: 200px; /* Make space for buttons */
}
.text {
  flex-shrink: 0;
  padding: 0 40px;
  white-space: nowrap;
}
.buttons-container {
  position: absolute;
  right: 0;
  display: flex;
  gap: 8px;
  padding-right: 12px;
}
.top-btn, .new-btn {
  /* background: rgba(255, 255, 255, 0.2); */
  border: none;
  color: inherit;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
  width: auto;
  text-transform: uppercase;
}
.top-btn:hover, .new-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
@keyframes scroll-rtl {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@media (max-width: 768px) {
  .track {
    padding-right: 160px;
  }
  .top-btn, .new-btn {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
