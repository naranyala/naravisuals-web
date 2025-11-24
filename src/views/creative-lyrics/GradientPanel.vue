<!-- GradientPanel.vue -->
<template>
  <section class="editor">
    <h2>Dynamic gradient panel</h2>

    <!-- Type -->
    <label>
      Type:
      <select v-model="type">
        <option value="linear">Linear</option>
        <option value="radial">Radial</option>
      </select>
    </label>

    <!-- Linear options -->
    <template v-if="type === 'linear'">
      <label>
        Angle: {{ angle }}°
        <input v-model.number="angle" type="range" min="0" max="360" />
      </label>
    </template>

    <!-- Radial options -->
    <template v-else>
      <label>
        Shape:
        <select v-model="radShape">
          <option value="circle">circle</option>
          <option value="ellipse">ellipse</option>
        </select>
      </label>
      <label>
        Size:
        <select v-model="radSize">
          <option value="closest-side">closest-side</option>
          <option value="closest-corner">closest-corner</option>
          <option value="farthest-side">farthest-side</option>
          <option value="farthest-corner">farthest-corner</option>
        </select>
      </label>
    </template>

    <!-- Color stops -->
    <div class="stops">
      <h3>Color stops</h3>
      <transition-group name="fade" tag="ul">
        <li v-for="(stop, idx) in stops" :key="stop.id">
          <input v-model="stop.color" type="color" />
          <input
            v-model.number="stop.pos"
            type="range"
            min="0"
            max="100"
            step="1"
          />
          <span>{{ stop.pos }}%</span>
          <button @click="removeStop(idx)" aria-label="Remove">×</button>
        </li>
      </transition-group>
      <button @click="addStop">+ Add stop</button>
    </div>

    <!-- CSS output -->
    <pre class="css">{{ gradientCSS }}</pre>
  </section>

  <!-- Live preview panel -->
  <div class="preview" :style="{ background: gradientCSS }" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid' // tiny util for unique keys

/* ----------- state ----------- */
const type = ref('linear')
const angle = ref(90)
const radShape = ref('ellipse')
const radSize = ref('farthest-corner')

// initial stops
const stops = ref([
  { id: uuid(), color: '#667eea', pos: 0 },
  { id: uuid(), color: '#764ba2', pos: 100 },
])

/* ----------- helpers ----------- */
function addStop() {
  const last = stops.value.at(-1)?.pos ?? 100
  stops.value.push({ id: uuid(), color: '#ffffff', pos: Math.min(100, last + 20) })
}
function removeStop(index) {
  if (stops.value.length > 2) stops.value.splice(index, 1)
}

/* ----------- computed gradient string ----------- */
const gradientCSS = computed(() => {
  const list = stops.value
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .map(s => `${s.color} ${s.pos}%`)
    .join(', ')

  if (type.value === 'linear') {
    return `linear-gradient(${angle.value}deg, ${list})`
  }
  return `radial-gradient(${radShape.value} ${radSize.value}, ${list})`
})
</script>

<style scoped>
.editor {
  display: grid;
  gap: 0.75rem;
  max-width: 320px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
label {
  display: grid;
  font-size: 0.9rem;
}
.stops ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.stops li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.stops button {
  margin-left: auto;
  border: none;
  background: transparent;
  color: crimson;
  font-size: 1.2rem;
  cursor: pointer;
}
.css {
  background: #f6f8fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  word-break: break-all;
}
.preview {
  margin-top: 1rem;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}

/* tiny transition for add/remove stops */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
