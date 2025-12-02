<template>
  <div class="gradient-app">
    <!-- Preview always on top -->
    <div class="preview" :style="{ background: gradientCSS }"></div>

    <!-- Controls -->
    <div class="controls">
      <h2>Gradient Editor</h2>

      <!-- Type and Color Space in one row -->
      <div class="row">
        <label class="control">
          <span>Type</span>
          <select v-model="type">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </label>

        <label class="control">
          <span>Color Space</span>
          <select v-model="colorSpace">
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
            <option value="oklab">OKLab</option>
            <option value="oklch">OKLCH</option>
          </select>
        </label>
      </div>

      <!-- Angle control (linear only) -->
      <label v-if="type === 'linear'" class="control full-width">
        <span>Angle: {{ angle }}°</span>
        <input v-model.number="angle" type="range" min="0" max="360">
      </label>

      <!-- Color Stops -->
      <div class="stops-section">
        <div class="section-header">
          <h3>Color Stops</h3>
          <button @click="addStop" class="btn-add">+ Add</button>
        </div>
        <div class="stops-list">
          <div v-for="(stop, idx) in stops" :key="stop.id" class="stop-item">
            <input v-model="stop.color" type="color" class="color-picker">
            <div class="stop-slider">
              <input v-model.number="stop.pos" type="range" min="0" max="100">
              <span>{{ stop.pos }}%</span>
            </div>
            <button @click="removeStop(idx)" class="btn-remove" v-if="stops.length > 2">×</button>
          </div>
        </div>
      </div>

      <!-- CSS Output -->
      <div class="output-section">
        <h3>CSS Code</h3>
        <pre class="css-code">{{ gradientCSS }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Core state
const type = ref('linear')
const angle = ref(90)
const colorSpace = ref('rgb')

// Color stops
let stopId = 0
const stops = ref([
  { id: stopId++, color: '#667eea', pos: 0 },
  { id: stopId++, color: '#764ba2', pos: 100 },
])

// Color space conversions (simplified - use a library like culori for production)
const colorConverters = {
  rgb: (color) => color, // Already in hex

  hsl: (color) => {
    // Simple hex to HSL conversion
    const r = parseInt(color.slice(1, 3), 16) / 255
    const g = parseInt(color.slice(3, 5), 16) / 255
    const b = parseInt(color.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    } else {
      s = 0
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  },

  oklab: (color) => {
    // Placeholder - use a proper color library in production
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Simple luminance approximation
    const l = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
    return `oklab(${l.toFixed(2)} 0.1 0.1)`
  },

  oklch: (color) => {
    // Placeholder - use a proper color library in production
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const l = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
    const c = Math.sqrt(r * r + g * g + b * b) / 442
    const h = Math.atan2(g - 128, r - 128) * 180 / Math.PI

    return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${Math.round((h + 360) % 360)})`
  }
}

// Methods
const addStop = () => {
  const lastPos = stops.value[stops.value.length - 1]?.pos || 100
  stops.value.push({
    id: stopId++,
    color: '#ffffff',
    pos: Math.min(100, lastPos + 20)
  })
}

const removeStop = (index) => {
  if (stops.value.length > 2) {
    stops.value.splice(index, 1)
  }
}

// Computed gradient
const gradientCSS = computed(() => {
  const sortedStops = [...stops.value].sort((a, b) => a.pos - b.pos)

  const stopList = sortedStops.map(stop => {
    const convertedColor = colorConverters[colorSpace.value](stop.color)
    return `${convertedColor} ${stop.pos}%`
  }).join(', ')

  if (type.value === 'linear') {
    return `linear-gradient(${angle.value}deg, ${stopList})`
  }
  return `radial-gradient(circle, ${stopList})`
})
</script>

<style scoped>
/* Base styles - same for mobile and desktop */
.gradient-app {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #0f172a;
  min-height: 100vh;
}

.preview {
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #1e293b;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.controls h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

/* Row layout for controls */
.row {
  display: flex;
  gap: 1rem;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.control.full-width {
  flex: 0 0 100%;
}

.control span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

select,
input[type="range"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.875rem;
}

/* Stops section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
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
}

.btn-add:hover {
  background: #2563eb;
}

.stops-list {
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

.color-picker {
  width: 48px;
  height: 48px;
  border: 2px solid #475569;
  border-radius: 8px;
  cursor: pointer;
  background: #0f172a;
}

.stop-slider {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stop-slider span {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #7f1d1d;
  color: #fca5a5;
  font-size: 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #991b1b;
  color: #fecaca;
}

/* Output section */
.output-section {
  margin-top: 0.5rem;
}

.output-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.css-code {
  background: #0f172a;
  color: #d1d5db;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  word-break: break-all;
  margin: 0;
  overflow-x: auto;
}

/* Desktop layout (same structure, just wider and side-by-side) */
@media (min-width: 768px) {
  .gradient-app {
    flex-direction: row;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .preview {
    width: 50%;
    height: 400px;
    position: sticky;
    top: 2rem;
  }

  .controls {
    width: 50%;
  }

  /* Make stop slider horizontal on desktop */
  .stop-slider {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .stop-slider span {
    min-width: 3rem;
  }
}
</style>
