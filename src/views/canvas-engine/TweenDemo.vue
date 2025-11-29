<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { tweenPlugin } from '../../lib/engine/tweenPlugin.js'

const canvasRef = ref(null)
const selectedEasing = ref('easeOutQuad')
const duration = ref(1000)
const isAnimating = ref(false)

let app = null
let demoShapes = []
let pathShape = null
let pathPoints = []

const easingGroups = {
  'Basic': ['linear'],
  'Quad': ['easeInQuad', 'easeOutQuad', 'easeInOutQuad'],
  'Cubic': ['easeInCubic', 'easeOutCubic', 'easeInOutCubic'],
  'Quart': ['easeInQuart', 'easeOutQuart', 'easeInOutQuart'],
  'Sine': ['easeInSine', 'easeOutSine', 'easeInOutSine'],
  'Expo': ['easeInExpo', 'easeOutExpo', 'easeInOutExpo'],
  'Circ': ['easeInCirc', 'easeOutCirc', 'easeInOutCirc'],
  'Back': ['easeInBack', 'easeOutBack', 'easeInOutBack'],
  'Elastic': ['easeInElastic', 'easeOutElastic', 'easeInOutElastic'],
  'Bounce': ['easeInBounce', 'easeOutBounce', 'easeInOutBounce']
}

onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = 1000
  canvas.height = 700

  app = createCanvasApp(canvas)
  app.use(shapePlugin)
  app.use(tweenPlugin)

  // Background
  app.ctx.fillStyle = '#0a0a1f'
  app.ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Title
  app.shapes.text(500, 30, 'Tween Animation Demo', 28, '#16f4d0')
  app.shapes.text(500, 60, 'Select easing and click buttons to animate', 16, '#a0a0c0')

  // Create demo shapes
  createDemoShapes()

  // Create path visualization
  createPathDemo()
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

function createDemoShapes() {
  // Main demo circle
  const mainCircle = app.shapes.circle(150, 350, 40, '#ff6b6b')

  // Comparison shapes
  const square = app.shapes.rect(150, 500, 60, 60, '#4ecdc4')
  const triangle = app.shapes.circle(150, 200, 35, '#ffe66d')

  demoShapes = [mainCircle, square, triangle]
}

function createPathDemo() {
  // Create a curved path
  pathPoints = [
    { x: 100, y: 350 },
    { x: 200, y: 250 },
    { x: 350, y: 200 },
    { x: 500, y: 250 },
    { x: 650, y: 350 },
    { x: 750, y: 450 },
    { x: 850, y: 350 }
  ]

  // Draw path line
  for (let i = 0; i < pathPoints.length - 1; i++) {
    app.shapes.line(
      pathPoints[i].x,
      pathPoints[i].y,
      pathPoints[i + 1].x,
      pathPoints[i + 1].y,
      2,
      'rgba(160, 160, 192, 0.3)'
    )
  }

  // Path follower
  pathShape = app.shapes.circle(pathPoints[0].x, pathPoints[0].y, 15, '#a8e6cf')
}

async function animateHorizontal() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.to(shape, 'x', 850, duration.value, selectedEasing.value)
  await app.tween.to(shape, 'x', 150, duration.value, 'linear')

  isAnimating.value = false
}

async function animateVertical() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.to(shape, 'y', 150, duration.value, selectedEasing.value)
  await app.tween.to(shape, 'y', 350, duration.value, 'linear')

  isAnimating.value = false
}

async function animateScale() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.toMultiple(shape, {
    scaleX: 2,
    scaleY: 2
  }, duration.value, selectedEasing.value)

  await app.tween.toMultiple(shape, {
    scaleX: 1,
    scaleY: 1
  }, duration.value, 'easeInQuad')

  isAnimating.value = false
}

async function animateRotate() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.to(shape, 'rotation', Math.PI * 2, duration.value, selectedEasing.value)
  shape.rotation = 0

  isAnimating.value = false
}

async function animateFade() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.to(shape, 'opacity', 0, duration.value, selectedEasing.value)
  await app.tween.to(shape, 'opacity', 1, duration.value, selectedEasing.value)

  isAnimating.value = false
}

async function animateMultiple() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.toMultiple(shape, {
    x: 850,
    y: 150,
    scaleX: 1.5,
    scaleY: 1.5,
    rotation: Math.PI * 2
  }, duration.value, selectedEasing.value)

  await app.tween.toMultiple(shape, {
    x: 150,
    y: 350,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  }, duration.value, 'easeInOutQuad')

  isAnimating.value = false
}

async function animateChain() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.chain(shape, [
    { props: { x: 500 }, duration: 500, easing: 'easeOutQuad' },
    { props: { y: 150 }, duration: 500, easing: 'easeOutBounce', delay: 200 },
    { props: { x: 850 }, duration: 500, easing: 'easeInOutQuad', delay: 200 },
    { props: { y: 550 }, duration: 500, easing: 'easeOutElastic', delay: 200 },
    { props: { x: 150, y: 350 }, duration: 800, easing: 'easeInOutCubic', delay: 200 }
  ])

  isAnimating.value = false
}

async function animatePath() {
  if (isAnimating.value) return
  isAnimating.value = true

  await app.tween.path(pathShape, pathPoints, duration.value * 2, selectedEasing.value)
  await new Promise(r => setTimeout(r, 300))
  await app.tween.path(pathShape, [...pathPoints].reverse(), duration.value * 2, 'linear')

  isAnimating.value = false
}

async function animateShake() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.shake(shape, 20, 600)

  isAnimating.value = false
}

async function animatePulse() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.pulse(shape, 'scaleX', 0.5, 600)
  await app.tween.pulse(shape, 'scaleY', 0.5, 600)

  isAnimating.value = false
}

async function animateFlash() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.flash(shape, 5, 150)

  isAnimating.value = false
}

async function animateSpring() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]
  await app.tween.spring(shape, 'x', 850, 80, 8)
  await new Promise(r => setTimeout(r, 300))
  await app.tween.spring(shape, 'x', 150, 80, 8)

  isAnimating.value = false
}

async function compareEasings() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shapes = demoShapes
  const easings = ['easeInQuad', 'easeOutQuad', 'easeInOutQuad']

  // Animate all shapes simultaneously with different easings
  await Promise.all(shapes.map((shape, i) =>
    app.tween.to(shape, 'x', 850, duration.value, easings[i] || 'linear')
  ))

  await new Promise(r => setTimeout(r, 300))

  await Promise.all(shapes.map((shape) =>
    app.tween.to(shape, 'x', 150, duration.value, 'linear')
  ))

  isAnimating.value = false
}

async function demoSequence() {
  if (isAnimating.value) return
  isAnimating.value = true

  const shape = demoShapes[0]

  // Complex animation sequence
  await app.tween.toMultiple(shape, { x: 500, y: 200 }, 600, 'easeOutQuad')
  await app.tween.pulse(shape, 'scaleX', 0.5, 400)
  await app.tween.flash(shape, 3, 150)
  await app.tween.to(shape, 'rotation', Math.PI * 4, 1000, 'easeInOutQuad')
  await app.tween.shake(shape, 15, 500)
  await app.tween.toMultiple(shape, {
    x: 150,
    y: 350,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  }, 800, 'easeOutElastic')

  isAnimating.value = false
}
</script>

<template>
  <div class="demo-container">
    <canvas ref="canvasRef"></canvas>

    <div class="controls">
      <div class="control-group">
        <h3>Settings</h3>
        <div class="slider-control">
          <label>Duration: {{ duration }}ms</label>
          <input type="range" v-model.number="duration" min="200" max="3000" step="100">
        </div>

        <div class="select-control">
          <label>Easing Function</label>
          <select v-model="selectedEasing">
            <optgroup v-for="(easings, group) in easingGroups" :key="group" :label="group">
              <option v-for="easing in easings" :key="easing" :value="easing">
                {{ easing }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="status" :class="{ active: isAnimating }">
          {{ isAnimating ? '▶️ Animating...' : '⏸️ Ready' }}
        </div>
      </div>

      <div class="control-group">
        <h3>Basic Animations</h3>
        <button @click="animateHorizontal" :disabled="isAnimating">➡️ Horizontal</button>
        <button @click="animateVertical" :disabled="isAnimating">⬆️ Vertical</button>
        <button @click="animateScale" :disabled="isAnimating">🔍 Scale</button>
        <button @click="animateRotate" :disabled="isAnimating">🔄 Rotate</button>
        <button @click="animateFade" :disabled="isAnimating">👁️ Fade</button>
      </div>

      <div class="control-group">
        <h3>Advanced Animations</h3>
        <button @click="animateMultiple" :disabled="isAnimating">✨ Multiple Props</button>
        <button @click="animateChain" :disabled="isAnimating">⛓️ Chain</button>
        <button @click="animatePath" :disabled="isAnimating">🛤️ Path</button>
        <button @click="animateSpring" :disabled="isAnimating">🌊 Spring</button>
      </div>

      <div class="control-group">
        <h3>Effects</h3>
        <button @click="animateShake" :disabled="isAnimating">📳 Shake</button>
        <button @click="animatePulse" :disabled="isAnimating">💓 Pulse</button>
        <button @click="animateFlash" :disabled="isAnimating">⚡ Flash</button>
      </div>

      <div class="control-group">
        <h3>Demos</h3>
        <button @click="compareEasings" :disabled="isAnimating">📊 Compare</button>
        <button @click="demoSequence" :disabled="isAnimating" class="special-btn">
          🎬 Full Demo
        </button>
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
  background: #0a0a1f;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: rgba(22, 244, 208, 0.05);
  border: 1px solid rgba(22, 244, 208, 0.2);
  border-radius: 8px;
  min-width: 180px;
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
  color: #0a0a1f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

button:hover:not(:disabled) {
  background: #14d4b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 244, 208, 0.5);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.special-btn {
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  color: white;
  font-size: 15px;
  padding: 12px 20px;
}

.special-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5252, #14d4b8);
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

.select-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.select-control label {
  color: #a0a0c0;
  font-size: 12px;
  font-weight: 500;
}

.select-control select {
  padding: 8px;
  background: rgba(22, 244, 208, 0.1);
  border: 1px solid rgba(22, 244, 208, 0.3);
  border-radius: 4px;
  color: #16f4d0;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.select-control select:hover {
  background: rgba(22, 244, 208, 0.15);
}

.select-control optgroup {
  background: #0a0a1f;
  color: #16f4d0;
  font-weight: 600;
}

.select-control option {
  background: #0a0a1f;
  color: #a0a0c0;
  padding: 5px;
}

.status {
  padding: 8px 12px;
  background: rgba(160, 160, 192, 0.1);
  border-radius: 4px;
  text-align: center;
  color: #a0a0c0;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.status.active {
  background: rgba(22, 244, 208, 0.2);
  color: #16f4d0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}
</style>
