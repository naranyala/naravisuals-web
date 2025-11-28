<template>
  <div class="demo">
    <h1>Shapes2D.js Demo in Vue 3</h1>

    <div class="controls">
      <button @click="createRandomShapes">Generate Random Shapes</button>
      <button @click="clear">Clear</button>
    </div>

    <canvas
      ref="canvas"
      width="600"
      height="400"
      @click="handleCanvasClick"
      style="border: 2px solid #333; background: #fafafa; cursor: crosshair;"
    ></canvas>

    <div class="info" v-if="hoveredShape">
      <h3>Hovered Shape</h3>
      <pre>{{ hoveredInfo }}</pre>
      <p><strong>Area:</strong> {{ hoveredShape.area().toFixed(2) }}</p>
      <p><strong>Perimeter:</strong> {{ hoveredShape.perimeter().toFixed(2) }}</p>
    </div>

    <!-- <div class="log"> -->
    <!--   <h3>Console Log</h3> -->
    <!--   <pre>{{ log }}</pre> -->
    <!-- </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

import { Shape2D, Point2D, ShapeType } from "../../utilities/shapes2d.js"

// Reactive state
const canvas = ref(null)
const ctx = ref(null)
const shapes = ref([])
const hoveredShape = ref(null)
const hoveredInfo = ref('')
const log = ref('')

// Load the external library when component mounts
onMounted(async () => {
  ctx.value = canvas.value.getContext('2d')

  createRandomShapes()
})

// Helper: log to screen
const addLog = (msg) => {
  log.value += msg + '\n'
}

// Random color
const randomColor = () => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate random shapes
const createRandomShapes = () => {
  shapes.value = []

  const w = 800, h = 600

  for (let i = 0; i < 15; i++) {
    const x = Math.random() * (w - 100) + 50
    const y = Math.random() * (h - 100) + 50
    const p = (min, max) => Math.random() * (max - min) + min

    const type = Math.floor(Math.random() * 5)
    let shape

    switch (type) {
      case 0:
        shape = Shape2D.circle(new Point2D(x, y), p(20, 60))
        break
      case 1:
        shape = Shape2D.rectangle(new Point2D(x, y), p(40, 120), p(40, 100))
        break
      case 2:
        const a = new Point2D(x + p(-60, 60), y + p(-60, 60))
        const b = new Point2D(x + p(-60, 60), y + p(-60, 60))
        const c = new Point2D(x + p(-60, 60), y + p(-60, 60))
        shape = Shape2D.triangle(a, b, c)
        break
      case 3:
        shape = Shape2D.line(
          new Point2D(x + p(-80, 80), y + p(-80, 80)),
          new Point2D(x + p(-80, 80), y + p(-80, 80))
        )
        break
      case 4:
        shape = Shape2D.point(new Point2D(x, y))
        break
    }

    shape.color = randomColor()
    shapes.value.push(shape)
  }

  addLog(`Generated ${shapes.value.length} random shapes`)
  draw()
}

// Canvas drawing
const draw = () => {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, 800, 600)

  hoveredShape.value = null

  shapes.value.forEach(shape => {

    ctx.value.strokeStyle = shape.color || '#000'
    ctx.value.fillStyle = (shape.color || '#000') + '33' // semi-transparent fill
    ctx.value.lineWidth = 3

    switch (shape.type) {
      case 'circle': {
        const { center, radius } = shape.data
        ctx.value.beginPath()
        ctx.value.arc(center.x, center.y, radius, 0, Math.PI * 2)
        ctx.value.fill()
        ctx.value.stroke()
        break
      }
      case 'rectangle': {
        const { bottomLeft, width, height } = shape.data
        ctx.value.fillRect(bottomLeft.x, bottomLeft.y, width, height)
        ctx.value.strokeRect(bottomLeft.x, bottomLeft.y, width, height)
        break
      }
      case 'triangle': {
        const { a, b, c } = shape.data
        ctx.value.beginPath()
        ctx.value.moveTo(a.x, a.y)
        ctx.value.lineTo(b.x, b.y)
        ctx.value.lineTo(c.x, c.y)
        ctx.value.closePath()
        ctx.value.fill()
        ctx.value.stroke()
        break
      }
      case 'line': {
        const { start, end } = shape.data
        ctx.value.beginPath()
        ctx.value.moveTo(start.x, start.y)
        ctx.value.lineTo(end.x, end.y)
        ctx.value.stroke()
        break
      }
      case 'point': {
        const p = shape.data
        ctx.value.fillStyle = shape.color || '#e74c3c'
        ctx.value.beginPath()
        ctx.value.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.value.fill()
        break
      }
    }
  })
}

// Click → test point-in-shape
const handleCanvasClick = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const point = new window.Shapes2D.Point2D(x, y)

  let found = false
  for (const shape of shapes.value) {
    if (shape.isPointInside(point)) {
      addLog(`Clicked inside a ${shape.type}! Area = ${shape.area().toFixed(2)}`)
      found = true
      // Visual feedback
      ctx.value.fillStyle = 'rgba(255, 255, 0, 0.5)'
      ctx.value.fillRect(0, 0, 800, 600)
      setTimeout(draw, 200)
    }
  }

  if (!found) {
    addLog('Clicked outside all shapes')
  }
}

// Mouse move → hover detection
canvas.value?.addEventListener('mousemove', (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const point = new window.Shapes2D.Point2D(x, y)

  hoveredShape.value = null
  for (const shape of shapes.value) {
    if (shape.isPointInside(point)) {
      hoveredShape.value = shape
      hoveredInfo.value = shape.type.toUpperCase() + '\n' + JSON.stringify(shape.data, null, 2)
      canvas.value.style.cursor = 'pointer'
      break
    }
  }
  if (!hoveredShape.value) {
    hoveredInfo.value = ''
    canvas.value.style.cursor = 'crosshair'
  }
})

const clear = () => {
  shapes.value = []
  draw()
  addLog('Canvas cleared')
}
</script>

<style scoped>
.demo {
  padding: 20px;
  font-family: system-ui, sans-serif;
}
.controls {
  margin: 20px 0;
  gap: 10px;
  display: flex;
}
button {
  padding: 10px 16px;
  font-size: 16px;
}
.info, .log {
  margin-top: 20px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  max-height: 300px;
  overflow: auto;
}
pre {
  margin: 0;
  font-size: 14px;
}
</style>
