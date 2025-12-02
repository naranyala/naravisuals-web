<template>
  <div class="container">
    <div class="controls">
      <button @click="togglePlay">{{ playing ? 'Pause' : 'Play' }}</button>
      <button @click="reset">Reset</button>

      <div class="slider-group">
        <label>
          Rings: {{ options.rings }}
          <input type="range" v-model.number="options.rings" min="1" max="5" @input="updatePattern" />
        </label>

        <label>
          Radius: {{ options.radius }}
          <input type="range" v-model.number="options.radius" min="20" max="80" @input="updatePattern" />
        </label>

        <label>
          Speed: {{ options.speed }}x
          <input type="range" v-model.number="options.speed" min="0.25" max="2" step="0.25" />
        </label>

        <label>
          Color:
          <input type="color" v-model="options.color" />
        </label>
      </div>
    </div>
    <canvas ref="canvasEl" class="flower-canvas" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { geometryPlugin } from '../../lib/engine/geometryPlugin.js'

/* ---------- reactive UI ---------- */
const canvasEl = ref(null)
const playing = ref(false)
let app = null
const emitterCR = 'flower-anim'

/* ---------- configurable options ---------- */
const options = reactive({
  rings: 3,        // Number of rings around center
  radius: 50,      // Radius of each circle
  speed: 1,        // Animation speed multiplier
  color: '#00bcd4', // Circle stroke color
  lineWidth: 1.5   // Stroke width
})

/* ---------- Build Flower of Life pattern (symmetric) ---------- */
function buildFlowerOfLife(cx, cy, r, rings) {
  const circles = []

  // Center circle
  circles.push({ x: cx, y: cy, r })

  // Generate rings
  for (let ring = 1; ring <= rings; ring++) {
    const numCircles = 6 * ring // Hexagonal packing: 6, 12, 18, 24...
    const distance = r * ring * 2 / Math.sqrt(3) // Distance for perfect overlap

    for (let i = 0; i < numCircles; i++) {
      const angle = (2 * Math.PI * i) / numCircles

      // Use hexagonal grid coordinates for perfect symmetry
      const gridX = Math.round(Math.cos(angle) * ring * 2) / 2
      const gridY = Math.round(Math.sin(angle) * ring * 2) / 2

      const x = cx + gridX * r * Math.sqrt(3) / 2
      const y = cy + gridY * r * 1.5

      // Check if circle already exists at this position (avoid duplicates)
      const exists = circles.some(c =>
        Math.abs(c.x - x) < 0.1 && Math.abs(c.y - y) < 0.1
      )

      if (!exists) {
        circles.push({ x, y, r })
      }
    }
  }

  return circles
}

/* ---------- Alternative: Classic hexagonal Flower of Life ---------- */
function buildFlowerOfLifeHex(cx, cy, r, rings) {
  const circles = []
  const sqrt3 = Math.sqrt(3)

  // Use hexagonal grid coordinates
  for (let q = -rings; q <= rings; q++) {
    for (let r_coord = -rings; r_coord <= rings; r_coord++) {
      const s = -q - r_coord

      // Check if within rings distance from center
      if (Math.abs(q) <= rings && Math.abs(r_coord) <= rings && Math.abs(s) <= rings) {
        // Convert hex coordinates to pixel coordinates
        const x = cx + r * (sqrt3 * q + sqrt3 / 2 * r_coord)
        const y = cy + r * (3 / 2 * r_coord)

        circles.push({ x, y, r })
      }
    }
  }

  return circles
}

/* ---------- animated draw ---------- */
function* animateCircles(data) {
  const delay = 300 / options.speed

  for (const { x, y, r } of data) {
    app.draw.circle(app.Circle(x, y, r), {
      stroke: options.color,
      width: options.lineWidth
    })
    yield delay
  }

  // Animation completed - update state
  playing.value = false
}

/* ---------- controls ---------- */
function togglePlay() {
  if (playing.value) {
    // Pause
    playing.value = false
    app.stopCoroutine(emitterCR)
  } else {
    // Play
    playing.value = true
    app.stopCoroutine(emitterCR)
    const data = buildFlowerOfLifeHex(
      app.canvas.width / 2,
      app.canvas.height / 2,
      options.radius,
      options.rings
    )
    app.start(animateCircles(data), emitterCR)
  }
}

function reset() {
  // Stop animation
  playing.value = false
  app.stopCoroutine(emitterCR)

  // Clear all drawn objects
  app.root.clear()

  // Redraw center point
  app.draw.point(app.Pt(app.canvas.width / 2, app.canvas.height / 2),
    { size: 4, color: options.color })
}

function updatePattern() {
  // Reset and regenerate pattern with new settings
  if (playing.value) {
    reset()
    togglePlay()
  } else {
    reset()
  }
}

/* ---------- life-cycle ---------- */
onMounted(() => {
  const canvas = canvasEl.value
  canvas.width = 800
  canvas.height = 600
  app = createCanvasApp(canvas)
  app.use(geometryPlugin)

  // Draw initial center point
  app.draw.point(app.Pt(canvas.width / 2, canvas.height / 2),
    { size: 4, color: options.color })
})

onUnmounted(() => app?.stop())
</script>

<style scoped>
.container {
  margin: 20px auto;
  max-width: 850px;
  padding: 0 20px;
  text-align: center;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 8px;
}

.controls>button {
  align-self: center;
}

button {
  padding: 10px 24px;
  background: #00bcd4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  min-width: 100px;
}

button:hover {
  background: #0097a7;
}

button:active {
  background: #00838f;
}

.slider-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #333;
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
  border: none;
}

input[type="color"] {
  width: 100%;
  height: 36px;
  border: 2px solid #333;
  border-radius: 4px;
  cursor: pointer;
  background: #222;
}

.flower-canvas {
  display: block;
  background: #111;
  border: 2px solid #333;
  border-radius: 8px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
</style>
