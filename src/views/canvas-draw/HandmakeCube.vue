<template>
  <div class="demo-section">
    <h2>3D Cube Demo (Centered)</h2>
    <canvas ref="cubeCanvas" width="600" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasUtility from '../../utilities/canvas.js'
import glmInspired from '../../utilities/glm-inspired.js'

const cubeCanvas = ref(null)
let cubeCanvasUtil = null
let animationFrameId = null
let cubeRotation = 0

onMounted(() => {
  initializeCubeDemo()
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})

function initializeCubeDemo() {
  if (!cubeCanvas.value) return
  cubeCanvasUtil = new CanvasUtility(cubeCanvas.value)
}

function drawCube() {
  if (!cubeCanvasUtil) return
  
  const canvas = cubeCanvasUtil.canvas
  const width = canvas.width
  const height = canvas.height
  
  // Clear canvas with dark background
  cubeCanvasUtil.clear().fill('#1a1a2e')
  
  // Cube vertices in local space (centered at origin)
  const vertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back face
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]     // front face
  ]
  
  // Cube edges (vertex indices)
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // back face
    [4, 5], [5, 6], [6, 7], [7, 4], // front face
    [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
  ]
  
  // Create transformation matrices
  const model = glmInspired.mat4.identity()
  
  // Apply rotation to model matrix
  const rotation = glmInspired.mat4.rotate(
    model, 
    cubeRotation, 
    glmInspired.vec3.set(new Float32Array(3), 0.3, 0.5, 0.2) // rotation axis
  )
  
  // Scale the cube to make it smaller
  const scaled = glmInspired.mat4.scale(
    rotation,
    glmInspired.vec3.set(new Float32Array(3), 0.8, 0.8, 0.8)
  )
  
  // Camera setup - looking at the cube
  const eye = glmInspired.vec3.set(new Float32Array(3), 0, 0, 5)
  const center = glmInspired.vec3.set(new Float32Array(3), 0, 0, 0)
  const up = glmInspired.vec3.set(new Float32Array(3), 0, 1, 0)
  
  const view = glmInspired.mat4.lookAt(eye, center, up)
  
  // Perspective projection
  const aspect = width / height
  const projection = glmInspired.mat4.perspective(
    Math.PI / 4, // 45 degrees FOV
    aspect, 
    0.1, // near plane
    100  // far plane
  )
  
  // Combine matrices: MVP = Projection * View * Model
  const viewModel = glmInspired.mat4.multiply(view, scaled)
  const mvp = glmInspired.mat4.multiply(projection, viewModel)
  
  // Transform vertices and project to screen
  const projectedVertices = vertices.map(vertex => {
    const v = new Float32Array([...vertex, 1])
    const transformed = transformVector(mvp, v)
    
    // Perspective divide
    const w = transformed[3]
    const ndcX = transformed[0] / w
    const ndcY = transformed[1] / w
    
    // Convert from normalized device coordinates to screen coordinates
    // NDC: [-1, 1] to Screen: [0, width] and [0, height]
    const screenX = (ndcX + 1) * 0.5 * width
    const screenY = (1 - ndcY) * 0.5 * height // Flip Y axis
    
    return { x: screenX, y: screenY }
  })
  
  // Draw edges
  cubeCanvasUtil.save()
  
  edges.forEach(edge => {
    const [start, end] = edge
    const p1 = projectedVertices[start]
    const p2 = projectedVertices[end]
    
    cubeCanvasUtil.drawLine(
      p1.x, p1.y, p2.x, p2.y, 
      '#e74c3c', 3, 'round'
    )
  })
  
  // Draw vertices
  projectedVertices.forEach(vertex => {
    cubeCanvasUtil.drawCircle(vertex.x, vertex.y, 4, '#3498db')
  })
  
  // Draw center point for reference
  cubeCanvasUtil.drawCircle(width / 2, height / 2, 3, '#ffffff')
  
  cubeCanvasUtil.restore()
  
  // Draw info text
  cubeCanvasUtil.drawText('Centered 3D Cube', 10, 20, {
    font: '16px Arial',
    fillStyle: '#ecf0f1'
  })
  
  cubeCanvasUtil.drawText(`Rotation: ${(cubeRotation * 180 / Math.PI).toFixed(1)}°`, 10, 40, {
    font: '14px Arial',
    fillStyle: '#bdc3c7'
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

function animate() {
  cubeRotation += 0.01
  drawCube()
  animationFrameId = requestAnimationFrame(animate)
}

function startAnimation() {
  if (!animationFrameId) {
    animate()
  }
}

function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}
</script>

<style scoped>
.demo-section {
  /* margin-bottom: 40px; */
  margin: 0 14vw;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  color: white;
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
}
</style>
