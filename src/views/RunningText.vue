<template>
  <div class="sticky-bar">
    <div class="marquee">
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "🔥 This is a running announcement text scrolling across the bottom bar."
  }
});
</script>

<style scoped>
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #222;
  color: #fff;
  padding: 10px 0;
  overflow: hidden;
  z-index: 999999; /* very top of stacking order */
}

.marquee {
  display: inline-block;
  white-space: nowrap;
  animation: scroll-left 15s linear infinite;
}

.marquee span {
  display: inline-block;
  padding-right: 100%;
}

@keyframes scroll-left {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
