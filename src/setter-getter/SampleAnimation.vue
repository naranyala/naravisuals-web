<template>
  <div>
    <h3>Animation Controller</h3>

    <div class="animation-box" :style="boxStyle">
      Animated Box
    </div>

    <div class="controls">
      <button @click="startAnimation" :disabled="anim.getIsPlaying()">
        {{ anim.getIsPlaying() ? 'Playing' : 'Start' }}
      </button>
      <button @click="anim.pause()" :disabled="!anim.getIsPlaying() || anim.getIsPaused()">
        Pause
      </button>
      <button @click="anim.resume()" :disabled="!anim.getIsPaused()">
        Resume
      </button>
      <button @click="anim.stop()">Stop</button>
    </div>

    <div class="progress">
      <input type="range" v-model.number="seekValue" min="0" max="100" @input="seekAnimation" />
      <span>{{ Math.round(seekValue) }}%</span>
    </div>

    <div class="stats">
      <p>Progress: {{ Math.round(anim.getProgress() * 100) }}%</p>
      <p>Eased: {{ Math.round(anim.getEasedProgress() * 100) }}%</p>
      <p>Iteration: {{ anim.getIteration() }}</p>
      <p>Time: {{ anim.getCurrentTime().toFixed(0) }}ms</p>
    </div>

    <div class="config">
      <label>
        Duration:
        <input type="number" v-model.number="config.duration" />ms
      </label>

      <label>
        Easing:
        <select v-model="config.easing">
          <option v-for="ease in easingOptions" :key="ease" :value="ease">
            {{ ease }}
          </option>
        </select>
      </label>

      <label>
        <input type="checkbox" v-model="config.loop" />
        Loop
      </label>

      <button @click="updateConfig">Update Config</button>
    </div>

    <div class="timeline">
      <div class="timeline-bar" :style="{ width: anim.getProgress() * 100 + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAnimation } from './useAnimation'

const config = ref({
  duration: 2000,
  easing: 'easeInOutCubic',
  loop: false
})

const seekValue = ref(0)
const easingOptions = ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
  'easeInCubic', 'easeOutCubic', 'easeInOutCubic']

const anim = useAnimation({
  duration: config.value.duration,
  easing: config.value.easing,
  loop: config.value.loop
})

const boxStyle = computed(() => {
  const progress = anim.getEasedProgress()
  return {
    transform: `translateX(${progress * 300}px) rotate(${progress * 360}deg)`,
    opacity: 0.5 + progress * 0.5,
    backgroundColor: `hsl(${progress * 360}, 70%, 60%)`
  }
})

function startAnimation() {
  anim.play((easedProgress) => {
    // Animation callback
    console.log('Animation progress:', easedProgress)
  })
}

function seekAnimation() {
  anim.seek(seekValue.value / 100)
}

function updateConfig() {
  anim.setDuration(config.value.duration)
  anim.setEasing(config.value.easing)
  anim.stop()
  startAnimation()
}

// Update seek slider when animation progresses
watch(() => anim.getProgress(), (progress) => {
  seekValue.value = progress * 100
})
</script>

<style scoped>
.animation-box {
  width: 100px;
  height: 100px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  border-radius: 8px;
  transition: none;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.progress input {
  flex: 1;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.config {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background: #e9ecef;
  border-radius: 4px;
}

.timeline {
  height: 4px;
  background: #dee2e6;
  border-radius: 2px;
  overflow: hidden;
  margin: 20px 0;
}

.timeline-bar {
  height: 100%;
  background: #28a745;
  transition: width 0.1s linear;
}
</style>
