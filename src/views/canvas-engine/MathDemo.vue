<template>
  <div class="math-demo">
    <h1>Math Plugin Demo</h1>

    <div class="controls">
      <select v-model="currentDemo" @change="switchDemo">
        <option value="functions">Function Plotting</option>
        <option value="parametric">Parametric Curves</option>
        <option value="polar">Polar Coordinates</option>
        <option value="vectors">Vector Field</option>
        <option value="lissajous">Lissajous Curves</option>
        <option value="waves">Wave Superposition</option>
        <option value="shapes">Mathematical Shapes</option>
      </select>

      <button @click="clearShapes">Clear</button>
      <button @click="toggleAnimation">{{ animationRunning ? 'Stop' : 'Start' }} Animation</button>
    </div>

    <div class="demo-controls" v-if="currentDemo === 'functions'">
      <label>Function:
        <select v-model="selectedFunction">
          <option value="sin">sin(x)</option>
          <option value="cos">cos(x)</option>
          <option value="quadratic">x²</option>
          <option value="cubic">x³</option>
          <option value="sinc">sinc(x)</option>
        </select>
      </label>
    </div>

    <div class="demo-controls" v-if="currentDemo === 'waves'">
      <div v-for="(wave, index) in waves" :key="index" class="wave-control">
        <label>Wave {{ index + 1 }}:
          <input type="range" v-model="wave.amplitude" min="1" max="50" @input="updateWaves">
          Amplitude: {{ wave.amplitude }}
        </label>
        <button @click="removeWave(index)" v-if="waves.length > 1">Remove</button>
      </div>
      <button @click="addWave">Add Wave</button>
    </div>

    <canvas ref="canvasEl" width="800" height="600"></canvas>

    <div class="info">
      <p>{{ demoDescription }}</p>
      <p>Math Utilities: Vector math, curves, waves, collisions, and more!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

const canvasEl = ref(null)
const app = ref(null)
const currentDemo = ref('functions')
const selectedFunction = ref('sin')
const animationRunning = ref(false)
const waves = ref([
  { amplitude: 20, frequency: 0.02, speed: 1 },
  { amplitude: 15, frequency: 0.03, speed: 1.5 }
])

const demoDescriptions = {
  functions: 'Plotting mathematical functions f(x)',
  parametric: 'Parametric curves (x(t), y(t))',
  polar: 'Polar coordinates r(θ)',
  vectors: 'Vector field visualization',
  lissajous: 'Lissajous curves and animations',
  waves: 'Wave superposition and interference',
  shapes: 'Mathematically generated shapes'
}

const demoDescription = computed(() => demoDescriptions[currentDemo.value])

// Function definitions
const functions = {
  sin: x => Math.sin(x),
  cos: x => Math.cos(x),
  quadratic: x => x * x * 0.2,
  cubic: x => x * x * x * 0.05,
  sinc: x => x === 0 ? 1 : Math.sin(x) / x
}

const parametricCurves = {
  circle: {
    x: t => Math.cos(t * Math.PI * 2),
    y: t => Math.sin(t * Math.PI * 2)
  },
  ellipse: {
    x: t => 2 * Math.cos(t * Math.PI * 2),
    y: t => Math.sin(t * Math.PI * 2)
  },
  spiral: {
    x: t => t * Math.cos(t * Math.PI * 8),
    y: t => t * Math.sin(t * Math.PI * 8)
  }
}

const polarFunctions = {
  circle: theta => 1,
  spiral: theta => theta * 0.3,
  rose: theta => Math.sin(3 * theta),
  cardioid: theta => 1 + Math.cos(theta)
}

onMounted(() => {
  if (!canvasEl.value) return

  app.value = createCanvasApp(canvasEl.value)
  app.value.use(shapePlugin)
  app.value.use(mathPlugin)

  setupDemo()
})

onUnmounted(() => {
  if (app.value) {
    app.value.stop()
  }
})

function setupDemo() {
  clearShapes()

  // Create coordinate system
  app.value.mathShapes.createCoordinateSystem(400, 300, 50, '#444')

  switch (currentDemo.value) {
    case 'functions':
      setupFunctionDemo()
      break
    case 'parametric':
      setupParametricDemo()
      break
    case 'polar':
      setupPolarDemo()
      break
    case 'vectors':
      setupVectorDemo()
      break
    case 'lissajous':
      setupLissajousDemo()
      break
    case 'waves':
      setupWaveDemo()
      break
    case 'shapes':
      setupShapesDemo()
      break
  }
}

function setupFunctionDemo() {
  const fn = functions[selectedFunction.value]
  app.value.mathShapes.plotFunction(fn, -6, 6, 200, '#ff6b6b', 3)

  // Add function label
  app.value.shapes.text(600, 100, `f(x) = ${getFunctionExpression()}`, 20, '#fff')
}

function setupParametricDemo() {
  Object.values(parametricCurves).forEach((curve, index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
    app.value.mathShapes.plotParametric(
      curve.x, curve.y, 0, 1, 100, colors[index], 2
    )
  })
}

function setupPolarDemo() {
  Object.values(polarFunctions).forEach((fn, index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
    app.value.mathShapes.plotPolar(fn, Math.PI * 4, 200, colors[index], 2)
  })
}

function setupVectorDemo() {
  // Create various vector fields
  const vectorFields = [
    (x, y) => app.value.math.vec2(0, 1), // Constant down
    (x, y) => app.value.math.vec2(y / 100, -x / 100), // Rotation
    (x, y) => app.value.math.vec2(
      Math.sin(x / 50) * 2,
      Math.cos(y / 50) * 2
    ) // Wave pattern
  ]

  vectorFields.forEach((field, index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']
    app.value.mathShapes.createVectorField(field, 60, 15, colors[index])
  })
}

function setupLissajousDemo() {
  animationRunning.value = true

  // Create multiple Lissajous curves
  const ratios = [
    { a: 3, b: 2, delta: Math.PI / 2 },
    { a: 4, b: 3, delta: Math.PI / 4 },
    { a: 5, b: 4, delta: 0 }
  ]

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']

  ratios.forEach((ratio, index) => {
    app.value.math.animations.createLissajous(
      ratio.a, ratio.b, ratio.delta, 80 + index * 40
    ).color = colors[index]
  })
}

function setupWaveDemo() {
  animationRunning.value = true
  app.value.math.animations.createWaveSuperposition(waves.value, 300, 50)
}

function setupShapesDemo() {
  const shapes = [
    theta => 1 + 0.3 * Math.sin(5 * theta), // Star
    theta => 0.5 + 0.5 * Math.cos(6 * theta), // Flower
    theta => 1 + 0.2 * Math.random(), // Random shape
    theta => Math.abs(Math.sin(4 * theta)) // Spiky
  ]

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']

  shapes.forEach((shapeFn, index) => {
    app.value.mathShapes.createShapeFromFunction(
      shapeFn,
      50 + index * 10,
      30,
      200 + (index % 2) * 400,
      150 + Math.floor(index / 2) * 300,
      colors[index]
    )
  })
}

function getFunctionExpression() {
  const expressions = {
    sin: 'sin(x)',
    cos: 'cos(x)',
    quadratic: 'x²',
    cubic: 'x³',
    sinc: 'sin(x)/x'
  }
  return expressions[selectedFunction.value]
}

function switchDemo() {
  animationRunning.value = false
  setupDemo()
}

function clearShapes() {
  if (!app.value) return

  // Remove all objects except the first one (background)
  while (app.value.root.objects.length > 0) {
    app.value.root.remove(app.value.root.objects[0])
  }
}

function toggleAnimation() {
  animationRunning.value = !animationRunning.value
  if (animationRunning.value) {
    setupDemo()
  } else {
    // Stop animations by clearing and recreating static version
    const demo = currentDemo.value
    clearShapes()
    currentDemo.value = demo
    setupDemo()
  }
}

function addWave() {
  waves.value.push({
    amplitude: 10,
    frequency: 0.02 + Math.random() * 0.02,
    speed: 1 + Math.random()
  })
  if (currentDemo.value === 'waves') {
    setupWaveDemo()
  }
}

function removeWave(index) {
  waves.value.splice(index, 1)
  if (currentDemo.value === 'waves') {
    setupWaveDemo()
  }
}

function updateWaves() {
  if (currentDemo.value === 'waves') {
    setupWaveDemo()
  }
}
</script>

<style scoped>
.math-demo {
  font-family: 'Arial', sans-serif;
  text-align: center;
  background: #1a1a2e;
  color: white;
  min-height: 100vh;
  padding: 20px;
}

.controls {
  margin: 20px 0;
}

.controls select,
.controls button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.controls button:hover {
  background: #2980b9;
}

.demo-controls {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 600px;
}

.wave-control {
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.wave-control label {
  display: block;
  margin-bottom: 5px;
}

.wave-control input {
  width: 200px;
  margin: 0 10px;
}

canvas {
  border: 2px solid #34495e;
  border-radius: 10px;
  background: #0f3460;
  margin: 20px auto;
  display: block;
}

.info {
  margin-top: 20px;
  font-size: 14px;
  color: #bdc3c7;
}
</style>
