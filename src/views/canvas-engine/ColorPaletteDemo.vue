<template>
  <div class="demo-container">
    <h1>Canvas Engine + Color Palette Demo</h1>

    <div class="controls">
      <button @click="addRandomShape">Add Random Shape</button>
      <button @click="addGradientShape">Add Gradient Shape</button>
      <button @click="cycleColors = !cycleColors">
        {{ cycleColors ? 'Stop' : 'Start' }} Color Cycling
      </button>
      <button @click="showPalette = !showPalette">
        {{ showPalette ? 'Hide' : 'Show' }} Palettes
      </button>
    </div>

    <div class="palette-selector" v-if="showPalette">
      <h3>Color Palettes:</h3>
      <div v-for="palette in availablePalettes" :key="palette" class="palette-item" @click="selectPalette(palette)"
        :class="{ active: selectedPalette === palette }">
        <span>{{ palette }}</span>
        <div class="palette-swatches">
          <div v-for="color in app?.colors.getPalette(palette)" :key="color" class="color-swatch"
            :style="{ backgroundColor: color }"></div>
        </div>
      </div>
    </div>

    <canvas ref="canvasEl" width="800" height="600" @click="onCanvasClick"></canvas>

    <div class="info">
      <p>Shapes: {{ shapes.length }} | Click on shapes to animate them!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { colorPalettePlugin } from '../../lib/engine/colorPalettePlugin.js'

// Refs
const canvasEl = ref(null)
const app = ref(null)
const shapes = ref([])
const cycleColors = ref(false)
const showPalette = ref(true)
const selectedPalette = ref('vibrant')

const availablePalettes = ['vibrant', 'pastel', 'monochrome', 'nature', 'sunset']

// Initialize canvas app
onMounted(() => {
  if (!canvasEl.value) return

  // Create canvas app
  app.value = createCanvasApp(canvasEl.value)

  // Use plugins
  app.value.use(shapePlugin)
  app.value.use(colorPalettePlugin)

  // Create initial shapes
  createInitialShapes()
})

// Cleanup
onUnmounted(() => {
  if (app.value) {
    app.value.stop()
  }
})

// Watch for color cycling changes
watch(cycleColors, (newVal) => {
  if (newVal) {
    startColorCycling()
  } else {
    stopColorCycling()
  }
})

// Create initial demo shapes
function createInitialShapes() {
  if (!app.value) return

  // Clear existing shapes
  shapes.value.forEach(shape => {
    app.value.root.remove(shape)
  })
  shapes.value = []

  // Create gradient background
  const bgGradient = app.value.colors.createGradient(
    app.value.colors.gradientTypes.LINEAR,
    ['#1a1a2e', '#16213e', '#0f3460'],
    0
  )
  const background = app.value.shapes.gradientRect(400, 300, 800, 600, bgGradient)
  shapes.value.push(background)

  // Create some colorful circles
  for (let i = 0; i < 5; i++) {
    const color = app.value.colors.getRandomFromPalette(selectedPalette.value)
    const circle = app.value.shapes.circle(
      100 + i * 150,
      150,
      40 + i * 10,
      color
    )
    circle.originalColor = color
    shapes.value.push(circle)
  }

  // Create gradient shapes
  const gradient1 = app.value.colors.createGradient(
    app.value.colors.gradientTypes.RADIAL,
    ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    0
  )
  const gradientCircle = app.value.shapes.gradientCircle(400, 400, 60, gradient1)
  shapes.value.push(gradientCircle)

  const gradient2 = app.value.colors.createGradient(
    app.value.colors.gradientTypes.LINEAR,
    ['#96CEB4', '#FFEAA7', '#FF6B6B'],
    45
  )
  const gradientRect = app.value.shapes.gradientRect(600, 400, 120, 80, gradient2)
  shapes.value.push(gradientRect)

  // Create palette displays
  if (showPalette.value) {
    createPaletteDisplays()
  }

  // Add some text
  const text = app.value.shapes.text(400, 50, 'Canvas Engine + Color Palette Demo', 28, '#ffffff')
  shapes.value.push(text)
}

// Create palette visualization
function createPaletteDisplays() {
  if (!app.value) return

  // Remove existing palette displays
  shapes.value = shapes.value.filter(shape => !shape.isPaletteDisplay)

  availablePalettes.forEach((paletteName, index) => {
    const display = app.value.shapes.paletteDisplay(
      150 + index * 130,
      500,
      paletteName,
      120,
      30
    )
    if (display) {
      display.isPaletteDisplay = true
      shapes.value.push(display)
    }
  })
}

// Add random shape
function addRandomShape() {
  if (!app.value) return

  const shapeTypes = ['circle', 'rect']
  const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
  const color = app.value.colors.getRandomFromPalette(selectedPalette.value)

  let shape
  if (type === 'circle') {
    shape = app.value.shapes.circle(
      Math.random() * 700 + 50,
      Math.random() * 400 + 100,
      Math.random() * 30 + 20,
      color
    )
  } else {
    shape = app.value.shapes.rect(
      Math.random() * 700 + 50,
      Math.random() * 400 + 100,
      Math.random() * 60 + 40,
      Math.random() * 60 + 40,
      color
    )
  }

  shape.originalColor = color
  shapes.value.push(shape)
}

// Add gradient shape
function addGradientShape() {
  if (!app.value) return

  const gradientType = Math.random() > 0.5
    ? app.value.colors.gradientTypes.LINEAR
    : app.value.colors.gradientTypes.RADIAL

  const colors = []
  for (let i = 0; i < 3; i++) {
    colors.push(app.value.colors.getRandomFromPalette(selectedPalette.value))
  }

  const gradient = app.value.colors.createGradient(
    gradientType,
    colors,
    Math.random() * 360
  )

  const shape = app.value.shapes.gradientCircle(
    Math.random() * 700 + 50,
    Math.random() * 400 + 100,
    Math.random() * 40 + 30,
    gradient
  )

  shapes.value.push(shape)
}

// Canvas click handler
function onCanvasClick(event) {
  if (!app.value) return

  const rect = canvasEl.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Find clicked shape
  const clickedShape = shapes.value.find(shape => {
    if (shape.hitTest && shape !== shapes.value[0]) { // Skip background
      return shape.hitTest(x, y)
    }
    return false
  })

  if (clickedShape) {
    // Animate the clicked shape
    app.value.animateTo(clickedShape, 'scaleX', 1.5, 200)
    app.value.animateTo(clickedShape, 'scaleY', 1.5, 200)

    // Create a coroutine to reset animation
    app.value.start(function* () {
      yield 200 // Wait for scale up
      app.value.animateTo(clickedShape, 'scaleX', 1, 200)
      app.value.animateTo(clickedShape, 'scaleY', 1, 200)
    })

    // Change color
    if (clickedShape.originalColor) {
      const newColor = app.value.colors.getRandomFromPalette(selectedPalette.value)
      clickedShape.color = newColor
    }
  }
}

// Color cycling animation
function startColorCycling() {
  if (!app.value) return

  shapes.value.forEach(shape => {
    if (shape.originalColor && !shape.isPaletteDisplay && shape !== shapes.value[0]) {
      const colors = app.value.colors.getPalette(selectedPalette.value)
      const colorCycler = app.value.colors.createColorCycler(colors, 3000)

      shape.update = function (dt) {
        colorCycler.update(dt)
        this.color = colorCycler.getCurrentColor()
      }
    }
  })
}

function stopColorCycling() {
  if (!app.value) return

  shapes.value.forEach(shape => {
    if (shape.originalColor && shape.update) {
      shape.color = shape.originalColor
      delete shape.update
    }
  })
}

// Palette selection
function selectPalette(paletteName) {
  selectedPalette.value = paletteName
  createInitialShapes()

  if (cycleColors.value) {
    startColorCycling()
  }
}

// Watch palette visibility
watch(showPalette, (newVal) => {
  if (newVal) {
    createPaletteDisplays()
  } else {
    shapes.value = shapes.value.filter(shape => !shape.isPaletteDisplay)
  }
})
</script>

<style scoped>
.demo-container {
  font-family: 'Arial', sans-serif;
  text-align: center;
  background: #2c3e50;
  color: white;
  min-height: 100vh;
  padding: 20px;
}

.controls {
  margin: 20px 0;
}

.controls button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.controls button:hover {
  background: #2980b9;
}

canvas {
  border: 2px solid #34495e;
  border-radius: 10px;
  background: #1a1a1a;
  margin: 20px auto;
  display: block;
}

.palette-selector {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 800px;
}

.palette-item {
  display: inline-block;
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.palette-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.palette-item.active {
  background: rgba(52, 152, 219, 0.3);
  border: 2px solid #3498db;
}

.palette-swatches {
  display: flex;
  margin-top: 5px;
  border-radius: 3px;
  overflow: hidden;
}

.color-swatch {
  width: 20px;
  height: 20px;
  flex: 1;
}

.info {
  margin-top: 20px;
  font-size: 14px;
  color: #bdc3c7;
}
</style>
