<template>
  <div class="sticky-bar" :class="`theme-${theme}`" :style="{ height }">
    <div class="track" ref="track" :style="{ animationDuration: `${speed}s` }">
      <span class="text"><slot>{{ text }}</slot></span>
      <span v-for="i in reps - 1" :key="i" class="text duplicate"><slot>{{ text }}</slot></span>
    </div>
    <button class="top-btn" @click="scrollToTop">scroll to top</button>
  </div>
</template>

<script>
export default {
  props: {
    text: { type: String, default: '' },
    speed: { type: Number, default: 20 },
    theme: { type: String, default: 'dark' },
    height: { type: String, default: '30px' }
  },
  data() {
    return { reps: 3 };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    updateReps() {
      const singleText = this.$refs.track?.firstElementChild;
      if (singleText) {
        this.reps = Math.max(3, Math.ceil(window.innerWidth * 2 / singleText.scrollWidth));
      }
    }
  },
  mounted() {
    this.updateReps();
    window.addEventListener('resize', this.updateReps);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateReps);
  }
};
</script>

<style scoped>
.sticky-bar {
  border-top: 1px solid lightgray;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: #fff;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding-right: 90px;
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
}

.text {
  flex-shrink: 0;
  padding: 0 40px;
  white-space: nowrap;
}

.top-btn {
  position: absolute;
  right: 0px;
  /* background: rgba(255, 255, 255, 0.2); */
  border: none;
  color: inherit;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.top-btn:hover {
  /* background: rgba(255, 255, 255, 0.3); */
}

@keyframes scroll-rtl {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .sticky-bar {
    padding-right: 75px;
  }
  .text {
    padding: 0 25px;
  }
  .top-btn {
    right: 12px;
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
