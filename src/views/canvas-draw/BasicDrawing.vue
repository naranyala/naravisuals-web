

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasUtility from '../../utilities/canvas.js'
import glmInspired from '../../utilities/glm-inspired.js'

// Canvas references
const basicCanvas = ref(null)

// Canvas utility instances
let basicCanvasUtil = null

// Animation control
let animationFrameId = null
let cubeRotation = 0
const mousePos = ref({ x: 0, y: 0 })

// Initialize all demos
onMounted(() => {
  initializeBasicDemo()
})

// onUnmounted(() => {})

// Demo 1: Basic Shapes
function initializeBasicDemo() {
  if (!basicCanvas.value) return
  
  basicCanvasUtil = new CanvasUtility(basicCanvas.value)
  
  // Clear with gradient background
  const gradient = basicCanvasUtil.createLinearGradient(0, 0, 600, 400, [
    { offset: 0, color: '#1e3c72' },
    { offset: 1, color: '#2a5298' }
  ])
  
  basicCanvasUtil
    .fill(gradient)
    .drawRoundedRect(50, 50, 200, 100, 20, '#e74c3c', '#c0392b', 3)
    .drawCircle(400, 150, 80, '#27ae60', '#2ecc71', 2)
    .drawEllipse(150, 280, 120, 60, Math.PI / 6, '#f39c12', '#e67e22', 2)
    .drawText('Canvas Utility Demo', 300, 350, {
      font: '24px Arial',
      fillStyle: '#ecf0f1',
      textAlign: 'center'
    })
}



// Helper function to transform vector by matrix
function transformVector(matrix, vector) {
  const result = new Float32Array(4)
  for (let i = 0; i < 4; i++) {
    result[i] = 
      matrix[i] * vector[0] +
      matrix[i + 4] * vector[1] +
      matrix[i + 8] * vector[2] +
      matrix[i + 12] * vector[3]
  }
  return result
}


function resetAll() {
  cubeRotation = 0
  initializeBasicDemo()
}
</script>

<template>
  <div class="demo-container">
    <h1>Canvas & 3D Math Demos</h1>
    
    <div class="demo-section">
      <h2>1. Basic Shapes Demo</h2>
      <canvas ref="basicCanvas" width="600" height="400"></canvas>
    </div>

  </div>
</template>


<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.demo-section h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.demo-section canvas {
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  background: white;
  display: block;
  margin: 0 auto;
  cursor: pointer;
}

.controls {
  text-align: center;
  margin-top: 30px;
}

.controls button {
  margin: 0 10px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.controls button:hover {
  background: #2980b9;
}

.controls button:active {
  transform: translateY(1px);
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
</style>
