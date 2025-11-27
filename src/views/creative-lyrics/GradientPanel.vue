<!-- GradientPanel.vue -->
<template>
  <div class="gradient-wrapper">
    <!-- Live preview panel - moved to top on mobile -->
    <div class="preview" :style="{ background: gradientCSS }" />

    <section class="editor">
      <h2>Dynamic gradient panel</h2>

      <!-- Type and primary controls in a grid -->
      <div class="controls-grid">
        <label class="control-item">
          <span class="label-text">Type</span>
          <select v-model="type">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </label>

        <!-- Linear options -->
        <template v-if="type === 'linear'">
          <label class="control-item full-width">
            <span class="label-text">Angle: {{ angle }}°</span>
            <input v-model.number="angle" type="range" min="0" max="360" />
          </label>
        </template>

        <!-- Radial options -->
        <template v-else>
          <label class="control-item">
            <span class="label-text">Shape</span>
            <select v-model="radShape">
              <option value="circle">Circle</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </label>
          <label class="control-item">
            <span class="label-text">Size</span>
            <select v-model="radSize">
              <option value="closest-side">Closest side</option>
              <option value="closest-corner">Closest corner</option>
              <option value="farthest-side">Farthest side</option>
              <option value="farthest-corner">Farthest corner</option>
            </select>
          </label>
        </template>
      </div>

      <!-- Color stops -->
      <div class="stops">
        <div class="stops-header">
          <h3>Color stops</h3>
          <button @click="addStop" class="btn-add">+ Add stop</button>
        </div>
        <transition-group name="fade" tag="ul">
          <li v-for="(stop, idx) in stops" :key="stop.id" class="stop-item">
            <input v-model="stop.color" type="color" class="color-input" />
            <div class="stop-controls">
              <input
                v-model.number="stop.pos"
                type="range"
                min="0"
                max="100"
                step="1"
                class="range-input"
              />
              <span class="pos-value">{{ stop.pos }}%</span>
            </div>
            <button @click="removeStop(idx)" class="btn-remove" aria-label="Remove">×</button>
          </li>
        </transition-group>
      </div>

      <!-- CSS output -->
      <details class="css-section">
        <summary>CSS Output</summary>
        <pre class="css">{{ gradientCSS }}</pre>
      </details>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid'

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
.gradient-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  /* max-width: 100%; */
  padding: 1rem;
  background: #0f172a;
  min-height: 100vh;
}

.preview {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  order: -1; /* Ensures preview is first on mobile */
  border: 1px solid #1e293b;
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.editor h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

/* Controls grid - responsive */
.controls-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-item.full-width {
  grid-column: 1 / -1;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

select {
  padding: 0.5rem;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #0f172a;
  color: #e2e8f0;
}

input[type="range"] {
  width: 100%;
  cursor: pointer;
}

/* Color stops */
.stops {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stops h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.stops ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stop-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
}

.color-input {
  width: 48px;
  height: 48px;
  border: 2px solid #475569;
  border-radius: 8px;
  cursor: pointer;
  background: #0f172a;
}

.stop-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.range-input {
  width: 100%;
}

.pos-value {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add:hover {
  background: #2563eb;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #7f1d1d;
  color: #fca5a5;
  font-size: 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #991b1b;
  color: #fecaca;
}

/* CSS output - collapsible on mobile */
.css-section {
  margin-top: 0.5rem;
}

.css-section summary {
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  user-select: none;
}

.css-section summary:hover {
  background: #e5e7eb;
}

.css {
  background: #1f2937;
  color: #d1d5db;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  word-break: break-all;
  margin-top: 0.5rem;
  overflow-x: auto;
}

/* Transitions */
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

/* Tablet and up */
@media (min-width: 640px) {
  .controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stop-item {
    grid-template-columns: auto 1fr auto auto;
  }
  
  .stop-controls {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
  
  .pos-value {
    min-width: 3rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .gradient-wrapper {
    flex-direction: row;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .preview {
    width: 50%;
    height: auto;
    min-height: 400px;
    order: 0;
  }
  
  .editor {
    width: 50%;
  }
}
</style>
