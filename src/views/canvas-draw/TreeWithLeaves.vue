<template>
  <div>
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    <div>
      <button @click="regenerateTree" style="margin-top: 10px;">Regenerate Tree</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CanvasUtility from '../../utilities/canvas.js'

// Canvas setup
const canvasRef = ref(null)
const width = 800
const height = 600

// Tree parameters
const treeParams = ref({
  trunkHeight: 150,
  trunkWidth: 30,
  trunkColor: '#8B4513',
  crownWidth: 300,
  crownHeight: 250,
  leafColor: '#228B22',
  leafCount: 80,
  leafSize: 15
})

let canvasUtil = null

onMounted(() => {
  if (canvasRef.value) {
    canvasUtil = new CanvasUtility(canvasRef.value)
    drawTree()
  }
})

function drawTree() {
  if (!canvasUtil) return
  
  // Clear canvas
  canvasUtil.clear()
  
  const ctx = canvasUtil.ctx
  const centerX = width / 2
  const groundY = height - 50
  
  // Draw sky background
  canvasUtil.drawRect(0, 0, width, height, '#87CEEB')
  
  // Draw ground
  canvasUtil.drawRect(0, groundY, width, 50, '#90EE90')
  
  // Draw trunk
  const trunkX = centerX - treeParams.value.trunkWidth / 2
  const trunkY = groundY - treeParams.value.trunkHeight
  
  canvasUtil.drawRoundedRect(
    trunkX, 
    trunkY, 
    treeParams.value.trunkWidth, 
    treeParams.value.trunkHeight, 
    5, 
    treeParams.value.trunkColor, 
    '#654321', 
    2
  )
  
  // Draw tree crown (leaves)
  const crownX = centerX - treeParams.value.crownWidth / 2
  const crownY = trunkY - treeParams.value.crownHeight
  
  // Draw main crown shape
  canvasUtil.drawRoundedRect(
    crownX, 
    crownY, 
    treeParams.value.crownWidth, 
    treeParams.value.crownHeight, 
    40, 
    treeParams.value.leafColor, 
    '#006400', 
    2
  )
  
  // Draw individual leaves for more natural look
  drawLeaves(crownX, crownY, treeParams.value.crownWidth, treeParams.value.crownHeight)
  
  // Add some texture to trunk
  addTrunkTexture(trunkX, trunkY, treeParams.value.trunkWidth, treeParams.value.trunkHeight)
}

function drawLeaves(x, y, width, height) {
  const leafCount = treeParams.value.leafCount
  
  for (let i = 0; i < leafCount; i++) {
    // Random position within crown area
    const leafX = x + Math.random() * width
    const leafY = y + Math.random() * height
    
    // Random size variation
    const size = treeParams.value.leafSize * (0.7 + Math.random() * 0.6)
    
    // Random color variation for natural look
    const colorVariation = Math.random() * 40 - 20
    const leafColor = `hsl(${120 + colorVariation}, 70%, ${35 + Math.random() * 10}%)`
    
    // Random rotation
    const rotation = Math.random() * 360
    
    canvasUtil.save()
    
    // Position and rotate for leaf
    canvasUtil.translateContext(leafX, leafY)
    canvasUtil.rotateContext(rotation, 0, 0)
    
    // Draw leaf as an oval/circle with slight variation
    if (Math.random() > 0.3) {
      // Most leaves as ovals
      canvasUtil.drawRoundedRect(
        -size/2, -size/3, 
        size, size * 0.7, 
        size/2, 
        leafColor, 
        'rgba(0, 100, 0, 0.3)', 
        1
      )
    } else {
      // Some leaves as simple circles
      canvasUtil.drawCircle(0, 0, size/2, leafColor, 'rgba(0, 100, 0, 0.3)', 1)
    }
    
    canvasUtil.restore()
  }
}

function addTrunkTexture(x, y, width, height) {
  // Add some bark texture lines
  const lineCount = 8
  
  for (let i = 0; i < lineCount; i++) {
    const lineX = x + (width / (lineCount + 1)) * (i + 1)
    const lineYVariation = Math.random() * 10 - 5
    
    canvasUtil.drawLine(
      lineX, y + lineYVariation, 
      lineX, y + height, 
      '#654321', 
      1 + Math.random()
    )
  }
  
  // Add some knots
  const knotCount = 3
  for (let i = 0; i < knotCount; i++) {
    const knotX = x + Math.random() * width
    const knotY = y + 20 + Math.random() * (height - 40)
    const knotSize = 3 + Math.random() * 4
    
    canvasUtil.drawCircle(knotX, knotY, knotSize, '#654321', '#5D4037', 1)
  }
}

function regenerateTree() {
  // Randomize tree parameters slightly
  treeParams.value = {
    trunkHeight: 120 + Math.random() * 60,
    trunkWidth: 25 + Math.random() * 10,
    trunkColor: '#8B4513',
    crownWidth: 250 + Math.random() * 100,
    crownHeight: 200 + Math.random() * 100,
    leafColor: '#228B22',
    leafCount: 60 + Math.random() * 40,
    leafSize: 12 + Math.random() * 8
  }
  
  drawTree()
}
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: Inter, sans-serif;
}

button:hover {
  background-color: #45a049;
}
</style>
