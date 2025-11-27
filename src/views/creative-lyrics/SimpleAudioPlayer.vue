<!-- SimpleAudioPlayer.vue -->
<template>
  <section class="player">

    <!-- 2. Transport buttons -->
    <div class="transport">
    <label class="file-btn">
      <input type="file" accept="audio/*" @change="loadFile" />
      📁 Pick audio
    </label>
      <button @click="togglePlay" :disabled="!src">
        {{ playing ? '⏸ Pause' : '▶ Play' }}
      </button>
      <button @click="stop" :disabled="!src">⏹ Stop</button>
    </div>

    <!-- 3. Timeline -->
    <div class="timeline">
      <span>{{ fmt(current) }}</span>
      <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        v-model.number="current"
        @input="seek"
        :disabled="!src"
      />
      <span>{{ fmt(duration) }}</span>
    </div>

    <!-- 4. Volume -->
    <label class="volume">
      🔊
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        v-model.number="volume"
        :disabled="!src"
      />
      {{ Math.round(volume * 100) }}%
    </label>

    <!-- Hidden audio element -->
    <audio ref="audio" :src="src" @loadedmetadata="onMeta" @timeupdate="onTime" @ended="onEnd" />
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

/* ---------- state ---------- */
const audio = ref(null)      // template ref
const src = ref('')          // object url
const playing = ref(false)
const current = ref(0)       // seconds
const duration = ref(0)      // seconds
const volume = ref(0.7)

/* ---------- methods ---------- */
function loadFile(e) {
  const file = e.target.files[0]
  if (!file) return
  stop()                     // reset old track
  src.value = URL.createObjectURL(file)
}

function togglePlay() {
  if (!src.value) return
  playing.value ? audio.value.pause() : audio.value.play()
  playing.value = !playing.value
}

function stop() {
  audio.value.pause()
  audio.value.currentTime = 0
  playing.value = false
}

function seek() {
  audio.value.currentTime = current.value
}

function onMeta() {
  duration.value = audio.value.duration
  audio.value.volume = volume.value
}

function onTime() {
  current.value = audio.value.currentTime
}

function onEnd() {
  playing.value = false
}

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/* keep volume slider in sync */
watch(volume, v => (audio.value && (audio.value.volume = v)))
</script>

<style scoped>
.player {
  display: grid;
  gap: 0.6rem;
  /* max-width: 420px; */
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: system-ui, sans-serif;
}
.file-btn {
  cursor: pointer;
  padding: 10px;
  background: black;;
  border-radius: 4px;
  margin: 0 5px;

  &:hover { background: gray; }

}
.file-btn input[type="file"] {
  display: none;
}
.transport button {
  margin-right: 0.5rem;
}
.timeline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.timeline input {
  flex: 1;
}
.volume {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
