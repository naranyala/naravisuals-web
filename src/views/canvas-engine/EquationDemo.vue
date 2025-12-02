<template>
  <div class="demo-container">
    <div class="controls">
      <h2>Math Equations Demo</h2>

      <div class="control-group">
        <label>Equation Type:</label>
        <select v-model="selectedEquation" @change="resetPlot">
          <option v-for="eq in Object.keys(equations)" :value="eq">{{ eq }}</option>

        </select>
      </div>


      <div class="control-group">
        <label>Grid Type:</label>
        <select v-model="gridType" @change="setupGrid">
          <option v-for="grid in gridList" :value="grid">{{ grid }}</option>
        </select>
      </div>


      <div class="equation-display">
        <h3>Current Equation:</h3>
        <p>{{ equationDisplay }}</p>
      </div>
    </div>

    <div class="canvas-container">
      <canvas ref="canvasEl" width="600" height="400"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'
import { xyGridAxesPlugin } from '../../lib/engine/xyGridAxesPlugin.js'

// Refs
const canvasEl = ref(null)
const app = ref(null)
const axes = ref(null)
const currentPlot = ref(null)
const scatterPoints = ref([])
const isAnimating = ref(false)

// State
const selectedEquation = ref('sine')
const gridType = ref('cartesian')
const params = ref({
  // Quadratic
  a: 1,
  b: 0,
  c: 0,

  // Sine
  amplitude: 1,
  frequency: 1,
  phase: 0,

  // Spiral
  tightness: 0.5
})

// Equation display strings
const equationDisplay = ref('y = sin(x)')

// Initialize when mounted
onMounted(() => {
  if (!canvasEl.value) return


  // Create canvas app
  app.value = createCanvasApp(canvasEl.value)

  // Load plugins
  app.value.use(mathPlugin)
  app.value.use(xyGridAxesPlugin)


  console.log("global: ", app.value)


  // Setup initial grid and plot
  setupGrid()
  resetPlot()

  // Add coordinate display
  app.value.coordinateDisplay({
    showScreenCoords: true,
    showWorldCoords: true,
    axesSystem: axes.value
  })

})


const gridList = ref([])

onMounted(() => {
  Object.keys(app.value.gridList).forEach(item => {
    gridList.value.push(item)
  })
})


// Cleanup
onUnmounted(() => {
  if (app.value) {
    app.value.stop()
  }
})

// Grid setup
function setupGrid() {
  // Clear existing grid
  app.value.root.objects = app.value.root.objects.filter(obj =>
    !obj._isGrid && !obj._isAxes
  )

  // console.log(gridType.value)
  // console.log(gridList.value)

  if (gridType.value === "cartesian") {
    setTimeout(() => {
      app.value.gridList.cartesian()._isGrid = true
    }, 1000)
  }
  if (gridType.value === 'polar') {
    app.value.gridList.polar()._isGrid = true
  }
  if (gridType.value === 'isometric') {
    app.value.gridList.isometric()._isGrid = true
  }
  if (gridType.value === 'hexagonal') {
    app.value.gridList.hexagonal()._isGrid = true
  }
  if (gridType.value === 'dot') {
    app.value.gridList.dot()._isGrid = true
  }
  if (gridType.value === 'perspective') {
    app.value.gridList.perspective()._isGrid = true
  }
  if (gridType.value === 'radial') {
    app.value.gridList.radial()._isGrid = true
  }

}

// Equation definitions
const equations = {
  sine: (x) => params.value.amplitude * Math.sin(params.value.frequency * x),
  quadratic: (x) => params.value.a * x * x + params.value.b * x + params.value.c,
  cubic: (x) => 0.1 * x * x * x - 0.5 * x,
  exponential: (x) => Math.exp(x * 0.3) - 5,
  logarithm: (x) => {
    if (x <= 0) return NaN
    return Math.log(x) * 2
  }
}

// Parametric equations
const parametricEquations = {
  circle: (t) => ({
    x: Math.cos(t * 2 * Math.PI),
    y: Math.sin(t * 2 * Math.PI)
  }),

  spiral: (t) => ({
    x: t * Math.cos(t * 10 * params.value.tightness),
    y: t * Math.sin(t * 10 * params.value.tightness)
  }),

  lissajous: (t) => ({
    x: Math.sin(3 * t * 2 * Math.PI),
    y: Math.sin(2 * t * 2 * Math.PI)
  })
}

// Polar equations
const polarEquations = {
  spiral: (theta) => params.value.tightness * theta
}

// Update equation display
function updateEquationDisplay() {
  const displays = {
    sine: `y = ${params.value.amplitude.toFixed(2)} · sin(${params.value.frequency.toFixed(2)}x)`,
    quadratic: `y = ${params.value.a.toFixed(2)}x² + ${params.value.b.toFixed(2)}x + ${params.value.c.toFixed(2)}`,
    cubic: 'y = 0.1x³ - 0.5x',
    exponential: 'y = e^(0.3x) - 5',
    logarithm: 'y = 2 · ln(x)',
    circle: 'x = cos(t), y = sin(t)',
    spiral: `r(θ) = ${params.value.tightness.toFixed(2)} · θ`,
    lissajous: 'x = sin(3t), y = sin(2t)'
  }
  equationDisplay.value = displays[selectedEquation.value]
}

// Reset and create new plot
function resetPlot() {
  updateEquationDisplay()

  // Remove old plot
  if (currentPlot.value) {
    app.value.root.remove(currentPlot.value)
  }

  const equationType = selectedEquation.value

  if (['sine', 'quadratic', 'cubic', 'exponential', 'logarithm'].includes(equationType)) {
    // Cartesian function plot
    currentPlot.value = app.value.math.plot.function(
      equations[equationType],
      {
        range: [-8, 8],
        steps: 200,
        color: '#ff3b30',
        lineWidth: 3,
        scale: 40
      }
    )

  } else if (['circle', 'spiral', 'lissajous'].includes(equationType)) {
    // Parametric plot
    currentPlot.value = app.value.math.plot.parametric(
      t => parametricEquations[equationType](t).x,
      t => parametricEquations[equationType](t).y,
      {
        tMin: 0,
        tMax: equationType === 'spiral' ? 4 * Math.PI : 1,
        steps: 200,
        color: '#007aff',
        lineWidth: 3,
        scale: 40
      }
    )
  }

  currentPlot.value._isPlot = true
}

// Update existing plot
function updatePlot() {
  updateEquationDisplay()
  resetPlot()
}

// Add random point to scatter plot
function addRandomPoint() {
  const x = app.value.randomRange(-6, 6)
  const y = app.value.randomRange(-4, 4)

  const point = app.value.math.plot.scatter([app.value.vec2(x * 40 + 400, -y * 40 + 300)], {
    color: '#5856d6',
    radius: 5,
    fill: true
  })

  scatterPoints.value.push(point)
}

// Clear all scatter points
function clearPoints() {
  scatterPoints.value.forEach(point => {
    app.value.root.remove(point)
  })
  scatterPoints.value = []
}

// Animate sine wave
function animateWave() {
  if (isAnimating.value) return

  isAnimating.value = true
  selectedEquation.value = 'sine'
  resetPlot()

  let phase = 0
  const animation = app.value.start(function* () {
    while (phase < 4 * Math.PI) {
      params.value.phase = phase
      updateEquationDisplay()

      // Update the sine function with phase
      if (currentPlot.value && currentPlot.value.points) {
        for (let i = 0; i < currentPlot.value.points.length; i++) {
          const x = -8 + (16 * i) / currentPlot.value.points.length
          const y = params.value.amplitude * Math.sin(params.value.frequency * x + phase)
          currentPlot.value.points[i].x = x * 40 + 400
          currentPlot.value.points[i].y = -y * 40 + 300
        }
      }

      phase += 0.1
      yield 50 // Wait 50ms
    }

    isAnimating.value = false
    params.value.phase = 0
    resetPlot() // Reset to original sine wave
  }, 'waveAnimation')
}

// Watch for equation changes
watch(selectedEquation, resetPlot)
watch(gridType, setupGrid)
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  width: 100%;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.control-group select,
.control-group input[type="range"] {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group button {
  width: 100%;
  padding: 8px 12px;
  margin: 5px 0;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.control-group button:hover {
  background: #0056cc;
}

.control-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.canvas-container {
  flex: 1;
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

canvas {
  width: 100%;
}

.equation-display {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 5px;
  border-left: 4px solid #007aff;
}

.equation-display h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.equation-display p {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #666;
}

h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007aff;
  padding-bottom: 10px;
}
</style>
