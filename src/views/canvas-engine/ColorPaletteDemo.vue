<template>
  <div class="palette-demo">
    <h1>Color Palette Explorer</h1>

    <div class="controls">
      <button @click="generateRandomPalette" class="generate-btn">
        🎲 Generate Random Palette
      </button>
      <button @click="cyclePalettes" class="cycle-btn">
        🔄 Cycle Palettes
      </button>
      <button @click="addCustomPalette" class="custom-btn">
        ➕ Add Custom Palette
      </button>
    </div>

    <div class="palette-display">
      <div v-for="(palette, index) in displayedPalettes" :key="index" class="palette-section">
        <h3>{{ palette.name }}</h3>
        <div class="palette-colors">
          <div v-for="(color, colorIndex) in palette.colors" :key="colorIndex" class="color-swatch"
            :style="{ backgroundColor: color }" @click="copyColorToClipboard(color)" :title="`Click to copy: ${color}`">
            <span class="color-hex">{{ color }}</span>
          </div>
        </div>
        <div class="palette-canvas">
          <canvas :ref="el => canvasRefs[palette.name] = el" :width="300" :height="100"></canvas>
        </div>
      </div>
    </div>


    <!-- Custom Palette Modal -->
    <div v-if="showCustomModal" class="modal-overlay" @click="showCustomModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add Custom Palette</h3>
        <div class="color-inputs">
          <div v-for="i in 5" :key="i" class="color-input">
            <input type="color" v-model="customColors[i - 1]" class="color-picker">
            <input type="text" v-model="customColors[i - 1]" placeholder="#FFFFFF" class="hex-input">
          </div>
        </div>
        <input type="text" v-model="customPaletteName" placeholder="Palette Name" class="name-input">
        <div class="modal-buttons">
          <button @click="saveCustomPalette" class="save-btn">Save</button>
          <button @click="showCustomModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted, watch, watchEffect } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { colorPalettePlugin } from '../../lib/engine/colorPalettePlugin.js'


const mainCanvas = ref(null)
const canvasRefs = ref({})
let app = null

// State
const displayedPalettes = ref([])
const showCustomModal = ref(false)
const customColors = ref(Array(5).fill('#FFFFFF'))
const customPaletteName = ref('')

// Predefined palettes
const basePalettes = [
  {
    name: 'Vibrant',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  },
  {
    name: 'Pastel',
    colors: ['#FFD1DC', '#C4E0F9', '#B5EAD7', '#FFC8A2', '#E2F0CB']
  },
  {
    name: 'Sunset',
    colors: ['#FF7E5F', '#FEB47B', '#FF6A95', '#A7226E', '#6A0572']
  },
  {
    name: 'Ocean',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E']
  },
  {
    name: 'Forest',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2']
  }
]

onMounted(() => {
  if (!mainCanvas.value) return

  // Initialize canvas app
  app = createCanvasApp(mainCanvas.value)
  app.use(shapesPlugin)
  app.use(colorPalettePlugin)

  // Load initial palettes
  displayedPalettes.value = [...basePalettes]

  // Register custom palettes with the color plugin
  basePalettes.forEach(palette => {
    app.colors.addPalette(palette.name.toLowerCase(), palette.colors)
  })

  // Draw initial previews
  drawPalettePreviews()

})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

watchEffect(() => {
  generateRandomPalette()
})

function generateRandomPalette() {
  const randomPalette = {
    name: `Random-${Math.floor(Math.random() * 1000)}`,
    colors: Array(5).fill().map(() => generateRandomColor())
  }

  // Add to displayed palettes (limit to 6)
  if (displayedPalettes.value.length >= 6) {
    displayedPalettes.value.pop()
  }
  displayedPalettes.value.unshift(randomPalette)

  // Register with color plugin
  app.colors.addPalette(randomPalette.name.toLowerCase(), randomPalette.colors)

  // Update visuals
  drawPalettePreviews()
}

function generateRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function cyclePalettes() {
  // Cycle through palettes in live preview
  const paletteNames = displayedPalettes.value.map(p => p.name.toLowerCase())
  let currentIndex = 0

  app.start(function* cycle() {
    while (true) {
      const paletteName = paletteNames[currentIndex]
      currentIndex = (currentIndex + 1) % paletteNames.length
      yield 1500 // Change every 1.5 seconds
    }
  })
}

function addCustomPalette() {
  showCustomModal.value = true
  customColors.value = Array(5).fill('#FFFFFF')
  customPaletteName.value = ''
}

function saveCustomPalette() {
  if (!customPaletteName.value.trim()) {
    alert('Please enter a palette name')
    return
  }

  const customPalette = {
    name: customPaletteName.value,
    colors: [...customColors.value]
  }

  // Add to displayed palettes
  if (displayedPalettes.value.length >= 6) {
    displayedPalettes.value.pop()
  }
  displayedPalettes.value.unshift(customPalette)

  // Register with color plugin
  app.colors.addPalette(customPalette.name.toLowerCase(), customPalette.colors)

  // Update visuals
  drawPalettePreviews()
  showCustomModal.value = false
}

function drawPalettePreviews() {
  // Use nextTick to ensure DOM is updated
  setTimeout(() => {
    displayedPalettes.value.forEach(palette => {
      const canvas = canvasRefs.value[palette.name]
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const swatchWidth = width / palette.colors.length

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw color swatches
      palette.colors.forEach((color, index) => {
        ctx.fillStyle = color
        ctx.fillRect(index * swatchWidth, 0, swatchWidth, height)
      })

      // Add gradient overlay
      const gradient = app.colors.createGradient(
        app.colors.gradientTypes.LINEAR,
        palette.colors,
        45
      )
      const gradientFill = gradient.apply(ctx, 0, 0, width, height)

      ctx.fillStyle = gradientFill
      ctx.globalAlpha = 0.3
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Add border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, width, height)
    })
  }, 100)
}


function copyColorToClipboard(color) {
  navigator.clipboard.writeText(color).then(() => {
    // Optional: Show a quick confirmation
    console.log(`Copied: ${color}`)
  }).catch(err => {
    console.error('Failed to copy color: ', err)
  })
}
</script>

<style scoped>
.palette-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #1a1a2e;
  color: white;
  min-height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #4ECDC4;
}

.controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.generate-btn {
  background: #FF6B6B;
  color: white;
}

.generate-btn:hover {
  background: #FF5252;
  transform: translateY(-2px);
}

.cycle-btn {
  background: #4ECDC4;
  color: white;
}

.cycle-btn:hover {
  background: #45B7D1;
  transform: translateY(-2px);
}

.custom-btn {
  background: #FFEAA7;
  color: #333;
}

.custom-btn:hover {
  background: #FFDC7A;
  transform: translateY(-2px);
}

.palette-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.palette-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.palette-section h3 {
  margin: 0 0 15px 0;
  text-align: center;
  color: #FFEAA7;
}

.palette-colors {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.color-swatch {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.color-swatch:hover {
  flex: 1.2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

.color-swatch:hover .color-hex {
  opacity: 1;
  transform: translateY(0);
}

.color-hex {
  color: white;
  font-weight: bold;
  font-size: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.palette-canvas {
  display: flex;
  justify-content: center;
}

.palette-canvas canvas {
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.demo-shapes {
  text-align: center;
  margin-top: 30px;
}

.preview-canvas {
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: #2d3047;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2d3047;
  padding: 30px;
  border-radius: 15px;
  min-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
  margin-top: 0;
  color: #4ECDC4;
  text-align: center;
}

.color-inputs {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.color-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.color-picker {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.hex-input {
  width: 80px;
  padding: 5px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a2e;
  color: white;
  text-align: center;
}

.name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a2e;
  color: white;
  margin: 15px 0;
  text-align: center;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.save-btn {
  background: #4ECDC4;
  color: white;
  padding: 10px 20px;
}

.cancel-btn {
  background: #666;
  color: white;
  padding: 10px 20px;
}

.save-btn:hover,
.cancel-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .palette-display {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  button {
    width: 200px;
  }
}
</style>
