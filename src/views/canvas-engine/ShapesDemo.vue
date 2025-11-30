<template>
  <div class="demo-container">
    <h2>total shapes: {{ shapeCount }}</h2>

    <canvas ref="canvasEl" width="600" height="400"></canvas>

    <div class="controls">
      <button @click="addRandomShape">Add Random Shape</button>
      <button @click="animateAll">Animate All</button>
      <button @click="clearAll">Clear All</button>
    </div>

    <div class="info">
      <p>Shapes: {{ shapeCount }}</p>
      <p>Pointer: ({{ pointer.x.toFixed(0) }}, {{ pointer.y.toFixed(0) }})</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watchEffect } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'

// Refs
const canvasEl = ref(null)
const app = ref(null)
const shapeCount = ref(0)

// Initialize canvas app when component mounts
onMounted(() => {
  if (!canvasEl.value) return

  // Create canvas app
  app.value = createCanvasApp(canvasEl.value)

  // Use shapes plugin
  app.value.use(shapesPlugin)

  // Create some initial shapes
  createDemoShapes()

  // Start a coroutine that runs every second
  app.value.start(function* pulseCircle() {
    while (true) {
      // Create a pulsing circle at random position
      const circle = app.value.shapes.circle(
        Math.random() * 600 + 100,
        Math.random() * 400 + 100,
        20,
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        { stroke: '#fff', lineWidth: 2 }
      )

      // Animate the circle
      app.value.animateTo(circle, 'scaleX', 2, 500)
      app.value.animateTo(circle, 'scaleY', 2, 500)
      app.value.animateTo(circle, 'opacity', 0, 500)

      // Remove after animation
      setTimeout(() => {
        app.value.root.remove(circle)
        shapeCount.value = app.value.root.objects.length
      }, 600)

      yield 1000 // Wait 1 second
    }
  }, 'pulseCircle')
})

// Cleanup when component unmounts
onUnmounted(() => {
  if (app.value) {
    app.value.stop()
  }
})

watchEffect(() => {
  setInterval(() => {
    addRandomShape()
  }, 700)

  setInterval(() => {
    animateAll()
  }, 1800)

})

// Computed pointer position
const pointer = computed(() => {
  return app.value?.pointer || { x: 0, y: 0 }
})

// Create initial demo shapes
function createDemoShapes() {
  if (!app.value) return

  // Create a circle
  app.value.shapes.circle(100, 100, 40, '#ff6b6b', {
    stroke: '#fff',
    lineWidth: 3
  })

  // Create a rectangle
  app.value.shapes.rect(200, 80, 120, 80, '#4ecdc4', {
    stroke: '#fff',
    lineWidth: 2
  })

  // Create a line with arrowhead
  app.value.shapes.line(50, 300, 300, 350, 4, '#45b7d1', {
    arrowhead: true
  })

  // Create a hexagon
  app.value.shapes.polygon(500, 150, 6, '#96ceb4', {
    radius: 50,
    stroke: '#fff',
    lineWidth: 2
  })

  // Create custom polygon (triangle)
  app.value.shapes.polygon(400, 300, [
    [0, -40],
    [-35, 40],
    [35, 40]
  ], '#feca57', {
    stroke: '#fff',
    lineWidth: 2
  })

  // Add text
  app.value.shapes.text('Vue + Canvas Demo!', 400, 400, '28px Arial', '#fff', {
    align: 'center',
    baseline: 'middle'
  })

  shapeCount.value = app.value.root.objects.length
}

// Add random shape
function addRandomShape() {
  if (!app.value) return

  const shapes = ['circle', 'rect', 'polygon']
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
  const x = Math.random() * 600 + 100
  const y = Math.random() * 400 + 100
  const color = `hsl(${Math.random() * 360}, 70%, 60%)`

  switch (randomShape) {
    case 'circle':
      app.value.shapes.circle(x, y, 20 + Math.random() * 30, color, {
        stroke: '#fff',
        lineWidth: 2
      })
      break

    case 'rect':
      app.value.shapes.rect(
        x, y,
        40 + Math.random() * 60,
        40 + Math.random() * 60,
        color, {
        stroke: '#fff',
        lineWidth: 2
      }
      )
      break

    case 'polygon':
      const sides = 3 + Math.floor(Math.random() * 5)
      app.value.shapes.polygon(x, y, sides, color, {
        radius: 20 + Math.random() * 30,
        stroke: '#fff',
        lineWidth: 2
      })
      break
  }

  shapeCount.value = app.value.root.objects.length
}

// Animate all shapes
function animateAll() {
  if (!app.value) return

  app.value.root.objects.forEach((obj, index) => {
    // Random rotation
    app.value.animateTo(obj, 'rotation', Math.random() * Math.PI * 2, 1000)

    // Bounce scale
    app.value.animateTo(obj, 'scaleX', 0.8 + Math.random() * 0.6, 800)
    app.value.animateTo(obj, 'scaleY', 0.8 + Math.random() * 0.6, 800)

    // Move to random position
    setTimeout(() => {
      app.value.animateTo(obj, 'x', Math.random() * 700 + 50, 600)
      app.value.animateTo(obj, 'y', Math.random() * 500 + 50, 600)
    }, index * 100)
  })
}

// Clear all shapes
function clearAll() {
  if (!app.value) return

  app.value.root.objects.length = 0
  shapeCount.value = 0

  // Recreate the text
  app.value.shapes.text('Vue + Canvas Demo!', 400, 400, '28px Arial', '#fff', {
    align: 'center',
    baseline: 'middle'
  })
  shapeCount.value = 1
}
</script>

<style scoped>
.demo-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

canvas {
  border: 2px solid #333;
  border-radius: 8px;
  background: #1a1a2e;
  cursor: crosshair;
}

.controls {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4ecdc4;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #45b7d1;
}

.info {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: monospace;
}

.info p {
  margin: 0.25rem 0;
}
</style>
