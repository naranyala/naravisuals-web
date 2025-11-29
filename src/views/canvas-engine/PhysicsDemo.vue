<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { physicsPlugin } from '../../lib/engine/physicsPlugin.js'

const canvasRef = ref(null)
const gravityX = ref(0)
const gravityY = ref(0.5)
const objectCount = ref(0)
const selectedMass = ref(1)
const selectedRestitution = ref(0.8)

let app = null
let isDragging = false
let dragStart = { x: 0, y: 0 }
let dragBody = null

onMounted(() => {
  // Initialize canvas
  const canvas = canvasRef.value
  canvas.width = 900
  canvas.height = 700

  // Create canvas app with plugins
  app = createCanvasApp(canvas)
  app.use(shapePlugin)
  app.use(physicsPlugin)

  // Set background
  app.ctx.fillStyle = '#0f0f1f'
  app.ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create title
  app.shapes.text(450, 30, 'Physics Engine Demo', 28, '#16f4d0')
  app.shapes.text(450, 60, 'Click to spawn objects • Drag to throw', 16, '#a0a0c0')

  // Create ground platforms
  createPlatform(150, 650, 250, 20, '#ff6b6b')
  createPlatform(450, 550, 300, 20, '#4ecdc4')
  createPlatform(750, 650, 250, 20, '#ffe66d')
  createPlatform(450, 400, 150, 20, '#a8e6cf')

  // Create walls
  app.physics.createRect(10, 350, 20, 700, {
    isStatic: true,
    color: '#2a2a4a'
  })
  app.physics.createRect(890, 350, 20, 700, {
    isStatic: true,
    color: '#2a2a4a'
  })

  // Add initial objects
  createRandomObject(200, 100)
  createRandomObject(400, 100)
  createRandomObject(600, 100)

  updateObjectCount()

  // Mouse events
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseup', handleMouseUp)
  canvas.addEventListener('click', handleClick)

  // Background rendering
  app.start(function* () {
    while (true) {
      app.ctx.fillStyle = 'rgba(15, 15, 31, 0.1)'
      app.ctx.fillRect(0, 0, canvas.width, canvas.height)
      yield 16
    }
  }, 'bg-fade')
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

function createPlatform(x, y, width, height, color) {
  app.physics.createRect(x, y, width, height, {
    isStatic: true,
    color
  })
}

function createRandomObject(x, y) {
  const type = Math.random() > 0.5 ? 'circle' : 'rect'
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#ffd93d']
  const color = colors[Math.floor(Math.random() * colors.length)]

  if (type === 'circle') {
    const radius = Math.random() * 20 + 15
    app.physics.createCircle(x, y, radius, {
      color,
      mass: selectedMass.value,
      restitution: selectedRestitution.value
    })
  } else {
    const width = Math.random() * 40 + 30
    const height = Math.random() * 40 + 30
    app.physics.createRect(x, y, width, height, {
      color,
      mass: selectedMass.value,
      restitution: selectedRestitution.value
    })
  }

  updateObjectCount()
}

function handleMouseDown(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Find body at mouse position
  const bodies = app.physics.getBodies()
  for (const body of bodies) {
    if (body.isStatic) continue

    let hit = false
    if (body.radius) {
      const dx = x - body.x
      const dy = y - body.y
      hit = (dx * dx + dy * dy) <= body.radius * body.radius
    } else if (body.width) {
      hit = Math.abs(x - body.x) <= body.width / 2 &&
        Math.abs(y - body.y) <= body.height / 2
    }

    if (hit) {
      isDragging = true
      dragStart = { x, y }
      dragBody = body
      dragBody.vx = 0
      dragBody.vy = 0
      break
    }
  }
}

function handleMouseMove(e) {
  if (!isDragging || !dragBody) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  dragBody.x = x
  dragBody.y = y
}

function handleMouseUp(e) {
  if (isDragging && dragBody) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Apply throw velocity
    const vx = (x - dragStart.x) * 0.3
    const vy = (y - dragStart.y) * 0.3
    dragBody.applyImpulse(vx, vy)
  }

  isDragging = false
  dragBody = null
}

function handleClick(e) {
  if (isDragging) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  createRandomObject(x, y)
}

function updateObjectCount() {
  const bodies = app.physics.getBodies()
  objectCount.value = bodies.filter(b => !b.isStatic).length
}

function spawnCircle() {
  const x = Math.random() * 700 + 100
  const y = 50
  const radius = Math.random() * 25 + 15
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf']

  app.physics.createCircle(x, y, radius, {
    color: colors[Math.floor(Math.random() * colors.length)],
    mass: selectedMass.value,
    restitution: selectedRestitution.value
  })

  updateObjectCount()
}

function spawnRect() {
  const x = Math.random() * 700 + 100
  const y = 50
  const width = Math.random() * 50 + 30
  const height = Math.random() * 50 + 30
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf']

  app.physics.createRect(x, y, width, height, {
    color: colors[Math.floor(Math.random() * colors.length)],
    mass: selectedMass.value,
    restitution: selectedRestitution.value
  })

  updateObjectCount()
}

function spawnPyramid() {
  const baseX = 450
  const baseY = 200
  const size = 30
  const rows = 5

  for (let row = 0; row < rows; row++) {
    const count = rows - row
    for (let col = 0; col < count; col++) {
      const x = baseX + (col - count / 2 + 0.5) * size
      const y = baseY + row * size

      app.physics.createRect(x, y, size - 2, size - 2, {
        color: '#4ecdc4',
        mass: 0.5,
        restitution: 0.3
      })
    }
  }

  updateObjectCount()
}

function applyExplosion() {
  const centerX = 450
  const centerY = 350
  const force = 50

  const bodies = app.physics.getBodies()
  for (const body of bodies) {
    if (body.isStatic) continue

    const dx = body.x - centerX
    const dy = body.y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 300 && dist > 0) {
      const strength = force * (1 - dist / 300)
      body.applyImpulse(
        (dx / dist) * strength,
        (dy / dist) * strength
      )
    }
  }
}

function clearAll() {
  const bodies = app.physics.getBodies().filter(b => !b.isStatic)
  bodies.forEach(body => app.physics.removeBody(body))
  updateObjectCount()
}

function updateGravity() {
  app.physics.setGravity(gravityX.value, gravityY.value)
}

function zeroGravity() {
  gravityX.value = 0
  gravityY.value = 0
  updateGravity()
}

function normalGravity() {
  gravityX.value = 0
  gravityY.value = 0.5
  updateGravity()
}

function reverseGravity() {
  gravityX.value = 0
  gravityY.value = -0.5
  updateGravity()
}
</script>

<template>
  <div class="demo-container">
    <canvas ref="canvasRef"></canvas>

    <div class="controls">
      <div class="control-group">
        <h3>Spawn Objects</h3>
        <button @click="spawnCircle">⚫ Circle</button>
        <button @click="spawnRect">⬛ Rectangle</button>
        <button @click="spawnPyramid">🔺 Pyramid</button>
      </div>

      <div class="control-group">
        <h3>Physics Properties</h3>
        <div class="slider-control">
          <label>Mass: {{ selectedMass.toFixed(1) }}</label>
          <input type="range" v-model.number="selectedMass" min="0.1" max="5" step="0.1">
        </div>
        <div class="slider-control">
          <label>Bounce: {{ selectedRestitution.toFixed(2) }}</label>
          <input type="range" v-model.number="selectedRestitution" min="0" max="1" step="0.05">
        </div>
      </div>

      <div class="control-group">
        <h3>Gravity Control</h3>
        <div class="slider-control">
          <label>X: {{ gravityX.toFixed(2) }}</label>
          <input type="range" v-model.number="gravityX" min="-1" max="1" step="0.1" @input="updateGravity">
        </div>
        <div class="slider-control">
          <label>Y: {{ gravityY.toFixed(2) }}</label>
          <input type="range" v-model.number="gravityY" min="-1" max="1" step="0.1" @input="updateGravity">
        </div>
        <div class="button-row">
          <button @click="zeroGravity" class="small-btn">Zero</button>
          <button @click="normalGravity" class="small-btn">Normal</button>
          <button @click="reverseGravity" class="small-btn">Reverse</button>
        </div>
      </div>

      <div class="control-group">
        <h3>Actions</h3>
        <button @click="applyExplosion">💥 Explosion</button>
        <button @click="clearAll" class="danger-btn">🗑️ Clear ({{ objectCount }})</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

canvas {
  border: 2px solid #16f4d0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(22, 244, 208, 0.3);
  cursor: grab;
  background: #0f0f1f;
}

canvas:active {
  cursor: grabbing;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: rgba(22, 244, 208, 0.05);
  border: 1px solid rgba(22, 244, 208, 0.2);
  border-radius: 8px;
  min-width: 200px;
}

.control-group h3 {
  margin: 0 0 5px 0;
  color: #16f4d0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  background: #16f4d0;
  color: #0f0f1f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

button:hover {
  background: #14d4b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 244, 208, 0.5);
}

button:active {
  transform: translateY(0);
}

.small-btn {
  padding: 8px 12px;
  font-size: 12px;
  flex: 1;
}

.button-row {
  display: flex;
  gap: 5px;
}

.danger-btn {
  background: #ff6b6b;
  color: white;
}

.danger-btn:hover {
  background: #ff5252;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
}

.slider-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.slider-control label {
  color: #a0a0c0;
  font-size: 12px;
  font-weight: 500;
}

.slider-control input[type="range"] {
  width: 100%;
  height: 6px;
  background: rgba(22, 244, 208, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-control input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #16f4d0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-control input[type="range"]::-webkit-slider-thumb:hover {
  background: #14d4b8;
  transform: scale(1.2);
}

.slider-control input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #16f4d0;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-control input[type="range"]::-moz-range-thumb:hover {
  background: #14d4b8;
  transform: scale(1.2);
}
</style>
