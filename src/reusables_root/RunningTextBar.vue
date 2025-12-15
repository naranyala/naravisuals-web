<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 60 },   // slow default
  height: { type: String, default: '30px' },
  position: { type: String, default: 'top' }
})

const reps = ref(3)
const track = ref()

const update = () => {
  const w = track.value?.firstElementChild?.scrollWidth || 1
  reps.value = Math.max(3, Math.ceil(innerWidth * 2 / w))
}

onMounted(() => (update(), addEventListener('resize', update)))
onBeforeUnmount(() => removeEventListener('resize', update))
</script>

<template>
  <div class="bar" :class="position" :style="{ height }">
    <div class="track" ref="track" :style="{ animationDuration: speed + 's' }">
      <span v-for="i in reps" :key="i" class="txt">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.bar{position:fixed;left:0;right:0;background:#1a1a1a;color:#fff;z-index:1000;overflow:hidden;display:flex;align-items:center;box-sizing:border-box}.top{top:0;border-bottom:1px solid lightgray}.bottom{bottom:0;border-top:1px solid lightgray}.track{display:flex;align-items:center;flex:1;animation:scroll-rtl linear infinite;will-change:transform;padding-right:200px}.txt{flex-shrink:0;padding:0 40px;white-space:nowrap}@keyframes scroll-rtl{from{transform:translateX(0)}to{transform:translateX(-50%)}}
</style>
