<!-- CanvasDrawer.vue -->
<template>
  <div class="canvas-demo">
    <canvas ref="canvasEl" width="500" height="400"></canvas>
    <button @click="summonRandomShape">Summon Random Shape</button>
  </div>
</template>

<script setup>
/* -------------------------------------
 *  Vue 3 <script setup>  (no return needed)
 * ------------------------------------- */
import { ref, onMounted, onUnmounted, computed, watchEffect } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'

/* ---------- refs / dom  ---------- */
const canvasEl = ref(null)          // canvas element
let app = null                      // canvas_util instance

/* ---------- lifecycle  ---------- */
onMounted(() => {
  app = createCanvasApp(canvasEl.value) // boot engine
  app.use(shapesPlugin)                 // plug shapes
  drawGrid()                            // background

  for (let i = 0; i < 30; i++) summonRandomShape()

})


/* ---------- helpers  ---------- */
function drawGrid() {
  const { width, height } = canvasEl.value
  const cx = width / 2
  const cy = height / 2
  const step = 50
  const grid = app.createLayer(-1) // behind everything

  // grid lines
  for (let x = 0; x <= width; x += step) {
    grid.add(app.createLine(x, 0, x, height, '#222', 1))
  }
  for (let y = 0; y <= height; y += step) {
    grid.add(app.createLine(0, y, width, y, '#222', 1))
  }
  // axes
  grid.add(app.createLine(cx, 0, cx, height, '#fff', 2))
  grid.add(app.createLine(0, cy, width, cy, '#fff', 2))
  // labels
  grid.add(app.createText(cx + 5, cy - 10, '0', { color: '#fff', font: '14px Arial' }))
  grid.add(app.createText(width - 20, cy + 15, 'X', { color: '#fff', font: 'bold 18px Arial' }))
  grid.add(app.createText(cx + 10, 20, 'Y', { color: '#fff', font: 'bold 18px Arial' }))
}

/* ---------- button action  ---------- */
function summonRandomShape() {
  const types = ['circle', 'rect', 'polygon', 'line']
  const type = types[Math.floor(Math.random() * types.length)]
  const color = app.colors?.randomColor()
  const { width, height } = canvasEl.value
  const x = app.randomRange(50, width - 50)
  const y = app.randomRange(50, height - 50)

  switch (type) {
    case 'circle':
      app.shapes.circle(x, y, app.randomRange(10, 40), color)
      break
    case 'rect':
      app.shapes.rect(x, y, app.randomRange(20, 80), app.randomRange(20, 80), color)
      break
    case 'polygon':
      app.shapes.polygon(x, y, app.randomInt(3, 8), color, { radius: app.randomRange(20, 50) })
      break
    case 'line':
      const x2 = x + app.randomRange(-100, 100)
      const y2 = y + app.randomRange(-100, 100)
      app.shapes.line(x, y, x2, y2, app.randomRange(2, 6), color, { arrowhead: Math.random() > 0.5 })
      break
  }
}

watchEffect(() => { })


</script>

<style scoped>
.canvas-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #111;
  color: #fff;
}

canvas {
  border: 1px solid #444;
  background: #000;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
