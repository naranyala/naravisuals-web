<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'

const canvasRef = ref(null)
let app = null
let shapes = []

onMounted(() => {
  // Initialize canvas
  const canvas = canvasRef.value
  canvas.width = 800
  canvas.height = 600

  // Create canvas app with shape plugin
  app = createCanvasApp(canvas)
  app.use(shapePlugin)

  // Set background
  app.ctx.fillStyle = '#1a1a2e'
  app.ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create initial shapes
  const title = app.shapes.text(400, 50, 'Canvas Engine Demo', 32, '#16f4d0')

  const circle = app.shapes.circle(200, 200, 50, '#ff6b6b')
  const rect = app.shapes.rect(400, 200, 100, 80, '#4ecdc4')
  const square = app.shapes.rect(600, 200, 70, 70, '#ffe66d')

  shapes.push(circle, rect, square)

  // Add click interaction
  canvas.addEventListener('click', handleCanvasClick)

  // Add floating animation
  app.start(function* () {
    while (true) {
      for (const shape of shapes) {
        app.animateTo(shape, 'y', shape.y + 20, 1000)
        yield 1000
        app.animateTo(shape, 'y', shape.y - 20, 1000)
        yield 1000
      }
    }
  }, 'float')
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

function handleCanvasClick(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Check if any shape was clicked
  for (const shape of shapes) {
    if (shape.hitTest && shape.hitTest(x, y)) {
      // Animate clicked shape
      app.animateTo(shape, 'scaleX', 1.5, 300)
      app.animateTo(shape, 'scaleY', 1.5, 300)

      setTimeout(() => {
        app.animateTo(shape, 'scaleX', 1, 300)
        app.animateTo(shape, 'scaleY', 1, 300)
      }, 300)

      break
    }
  }
}

function addRandomCircle() {
  const x = Math.random() * 700 + 50
  const y = Math.random() * 400 + 150
  const r = Math.random() * 30 + 20
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94']
  const color = colors[Math.floor(Math.random() * colors.length)]

  const circle = app.shapes.circle(x, y, r, color)
  circle.opacity = 0
  shapes.push(circle)

  app.animateTo(circle, 'opacity', 1, 500)
}

function animateAll() {
  shapes.forEach((shape, i) => {
    setTimeout(() => {
      app.animateTo(shape, 'scaleX', 1.3, 400)
      app.animateTo(shape, 'scaleY', 1.3, 400)

      setTimeout(() => {
        app.animateTo(shape, 'scaleX', 1, 400)
        app.animateTo(shape, 'scaleY', 1, 400)
      }, 400)
    }, i * 100)
  })
}

function rotateAll() {
  shapes.forEach((shape, i) => {
    setTimeout(() => {
      app.animateTo(shape, 'rotation', shape.rotation + Math.PI * 2, 800)
    }, i * 100)
  })
}

function resetCanvas() {
  // Remove all shapes except title
  shapes.forEach(shape => app.root.remove(shape))
  shapes = []

  // Recreate initial shapes
  const circle = app.shapes.circle(200, 200, 50, '#ff6b6b')
  const rect = app.shapes.rect(400, 200, 100, 80, '#4ecdc4')
  const square = app.shapes.rect(600, 200, 70, 70, '#ffe66d')

  shapes.push(circle, rect, square)
}

function fadeShapes() {
  shapes.forEach((shape, i) => {
    setTimeout(() => {
      app.animateTo(shape, 'opacity', 0.3, 600)

      setTimeout(() => {
        app.animateTo(shape, 'opacity', 1, 600)
      }, 600)
    }, i * 150)
  })
}
</script>

<template>
  <div class="demo-container">
    <h1>Canvas Engine Vue Demo</h1>
    <p>Click shapes to animate them!</p>

    <canvas ref="canvasRef"></canvas>

    <div class="controls">
      <button @click="addRandomCircle">Add Circle</button>
      <button @click="animateAll">Animate All</button>
      <button @click="rotateAll">Rotate All</button>
      <button @click="fadeShapes">Fade Effect</button>
      <button @click="resetCanvas">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #16f4d0;
  margin-bottom: 10px;
  font-size: 2rem;
}

p {
  color: #a0a0c0;
  margin-bottom: 20px;
}

canvas {
  border: 2px solid #16f4d0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(22, 244, 208, 0.2);
  cursor: pointer;
  background: #1a1a2e;
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background: #16f4d0;
  color: #0f0f23;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

button:hover {
  background: #14d4b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 244, 208, 0.4);
}

button:active {
  transform: translateY(0);
}
</style>
