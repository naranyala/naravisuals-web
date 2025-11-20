<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  autoplay?: boolean
  interval?: number
  loop?: boolean
}>()

const current = ref(0)
const slides = ref<HTMLElement[]>([])
let timer: any

const next = () => {
  current.value = current.value === slides.value.length - 1 ? (props.loop ? 0 : current.value) : current.value + 1
}

const prev = () => {
  current.value = current.value === 0 ? (props.loop ? slides.value.length - 1 : 0) : current.value - 1
}

const goTo = (index: number) => current.value = index

if (props.autoplay) {
  timer = setInterval(next, props.interval || 4000)
  onUnmounted(() => clearInterval(timer))
}
</script>

<template>
  <div class="carousel" @mouseenter="autoplay && clearInterval(timer)" @mouseleave="autoplay && (timer = setInterval(next, interval || 4000))">
    <div class="carousel-track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <slot />
    </div>

    <button class="carousel-prev" @click="prev">‹</button>
    <button class="carousel-next" @click="next">›</button>

    <div class="carousel-dots">
      <button
        v-for="(_, i) in $slots.default?.()[0].children.length || 1"
        :key="i"
        :class="{ active: i === current }"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel { position: relative; overflow: hidden; border-radius: 12px; }
.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.carousel-track > * { min-width: 100%; }
.carousel-prev, .carousel-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.5); color: white; border: none;
  width: 50px; height: 50px; border-radius: 50%; cursor: pointer;
  font-size: 1.5rem; z-index: 10;
}
.carousel-prev { left: 1rem; }
.carousel-next { right: 1rem; }
.carousel-dots {
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: 0.5rem;
}
.carousel-dots button {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255,255,255,0.5); border: none; cursor: pointer;
}
.carousel-dots button.active { background: white; }
</style>
