<template>
  <div class="demo-container">
    <div class="controls">
      <h3>Geometric Algebra Demo</h3>
      <button @click="setMode('point')">Add Points</button>
      <button @click="setMode('line')">Draw Lines</button>
      <button @click="handleClearAll">Clear All</button>
      <div class="info">
        <p>Mode: {{ mode }}</p>
        <p>Points: {{ points.length }}</p>
        <p>Lines: {{ lines.length }}</p>
      </div>
    </div>
    <canvas ref="canvas" width="800" height="600"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { geomAlgPlugin } from '../../lib/engine/geomAlgPlugin.js'

const canvas = ref(null)
let app = null
const points = reactive([])
const lines = reactive([])
const mode = ref('point')

onMounted(() => {
  // Initialize canvas app
  app = createCanvasApp(canvas.value)

  // Install geometric algebra plugin
  app.use(geomAlgPlugin)

  // Handle canvas clicks
  canvas.value.addEventListener('click', handleCanvasClick)

  // Add some initial points for demonstration
  addPoint(200, 200)
  addPoint(400, 300)
  addPoint(600, 200)
})

function handleCanvasClick(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (mode.value === 'point') {
    addPoint(x, y)
  } else if (mode.value === 'line') {
    if (points.length >= 2) {
      drawRandomLine()
    } else {
      console.log('Need at least 2 points to draw lines')
    }
  }
}

function setMode(newMode) {
  mode.value = newMode
}

function addPoint(x, y) {
  // Create geometric algebra point
  const gaPoint = app.geomAlg.point(x, y)

  // Draw the point
  const pointObj = app.geomAlg.drawPoint(gaPoint, {
    radius: 8,
    color: '#ff0080',
    fill: true
  })

  // Add to layer and track
  app.root.add(pointObj)
  points.push({ x, y, ga: gaPoint, obj: pointObj })

  // Auto-draw lines when we have 2+ points and in line mode
  if (points.length >= 2 && mode.value === 'line') {
    drawLinesBetweenPoints()
  }
}

function drawLinesBetweenPoints() {
  // Clear existing lines first
  clearLines()

  // Draw lines between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    // Create line using geometric algebra
    const line = app.geomAlg.join(p1.ga, p2.ga)

    // Draw the line
    const lineObj = app.geomAlg.drawLine(line, {
      color: '#00aaff',
      width: 3,
      extend: 500
    })

    app.root.add(lineObj)
    lines.push({ ga: line, obj: lineObj, from: i, to: i + 1 })
  }
}

function drawRandomLine() {
  if (points.length < 2) return

  // Pick two different random points
  let idx1 = Math.floor(Math.random() * points.length)
  let idx2 = Math.floor(Math.random() * points.length)

  // Ensure they're different
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * points.length)
  }

  const p1 = points[idx1]
  const p2 = points[idx2]

  // Create and draw line
  const line = app.geomAlg.join(p1.ga, p2.ga)
  const lineObj = app.geomAlg.drawLine(line, {
    color: '#00ff00',
    width: 2,
    extend: 300
  })

  app.root.add(lineObj)
  lines.push({ ga: line, obj: lineObj, from: idx1, to: idx2 })
}

function clearLines() {
  // Remove all line objects from the canvas
  lines.forEach(line => {
    if (line.obj && app.root) {
      app.root.remove(line.obj)
    }
  })
  lines.length = 0 // Clear the array
}

function handleClearAll() {
  console.log('Clearing all points and lines')

  // Clear points
  points.forEach(point => {
    if (point.obj && app.root) {
      app.root.remove(point.obj)
    }
  })
  points.length = 0

  // Clear lines
  clearLines()
}

// Add some interactive animations
watch(mode, (newMode) => {
  if (app && points.length > 0) {
    // Animate existing points when mode changes
    points.forEach((point, index) => {
      app.tween(point.obj, {
        scaleX: newMode === 'point' ? 1.2 : 1,
        scaleY: newMode === 'point' ? 1.2 : 1
      }, 300, 'easeOutBounce')
    })
  }
})
</script>

<style scoped>
.demo-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  width: 200px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.controls h3 {
  margin-top: 0;
  color: #333;
}

.controls button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #0056b3;
}

.info {
  margin-top: 20px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.info p {
  margin: 5px 0;
  font-size: 14px;
}

canvas {
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: crosshair;
}
</style>
