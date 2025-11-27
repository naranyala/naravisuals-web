
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasUtility from '../../utilities/canvas.js'
import glmInspired from '../../utilities/glm-inspired.js'

// Canvas references
const basicCanvas = ref(null)
const particleCanvas = ref(null)

// Canvas utility instances
let basicCanvasUtil = null
let particleCanvasUtil = null

// Animation control
let animationFrameId = null
let cubeRotation = 0
const particles = ref([])
const mousePos = ref({ x: 0, y: 0 })

// Initialize all demos
onMounted(() => {
  initializeBasicDemo()
  initializeParticleDemo()
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})

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

// Demo 3: Interactive Particles
function initializeParticleDemo() {
  if (!particleCanvas.value) return
  
  particleCanvasUtil = new CanvasUtility(particleCanvas.value)
  resetParticles()
}

function resetParticles() {
  particles.value = Array.from({ length: 100 }, () => ({
    x: Math.random() * 600,
    y: Math.random() * 400,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 1
  }))
  mousePos.value = { x: 300, y: 200 }
}

function updateParticles() {
  particles.value.forEach(particle => {
    // Mouse attraction
    const dx = mousePos.value.x - particle.x
    const dy = mousePos.value.y - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 150) {
      const force = 0.1
      particle.vx += (dx / distance) * force
      particle.vy += (dy / distance) * force
    }
    
    // Update position
    particle.x += particle.vx
    particle.y += particle.vy
    
    // Bounce off walls
    if (particle.x <= 0 || particle.x >= 600) particle.vx *= -0.8
    if (particle.y <= 0 || particle.y >= 400) particle.vy *= -0.8
    
    // Keep in bounds
    particle.x = Math.max(0, Math.min(600, particle.x))
    particle.y = Math.max(0, Math.min(400, particle.y))
    
    // Damping
    particle.vx *= 0.99
    particle.vy *= 0.99
    
    // Life cycle
    particle.life = Math.max(0, particle.life - 0.002)
    if (particle.life <= 0) {
      particle.x = Math.random() * 600
      particle.y = Math.random() * 400
      particle.life = 1
    }
  })
}

function drawParticles() {
  if (!particleCanvasUtil) return
  
  particleCanvasUtil.clear().fill('#1a1a2e')
  
  // Draw particles with life-based opacity
  particleCanvasUtil.drawParticles(particles.value, {
    fillStyle: '#3498db',
    minSize: 1,
    maxSize: 4,
    minOpacity: 0.1,
    maxOpacity: 0.8
  })
  
  // Draw mouse influence area
  particleCanvasUtil.drawCircle(
    mousePos.value.x, 
    mousePos.value.y, 
    150, 
    null, 
    'rgba(52, 152, 219, 0.3)', 
    2
  )
}

// Event handlers
function onParticleMouseMove(event) {
  const rect = particleCanvas.value.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// Animation loop
function animate() {
  cubeRotation += 0.02
  updateParticles()
  
  drawParticles()
  
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

function resetAll() {
  cubeRotation = 0
  resetParticles()
  initializeBasicDemo()
  drawParticles()
}
</script>

<template>
  <div class="demo-container">
    <h1>Canvas & 3D Math Demos</h1>
    
    <div class="demo-section">
      <h2>1. Basic Shapes Demo</h2>
      <canvas ref="basicCanvas" width="600" height="400"></canvas>
    </div>


    <div class="demo-section">
      <h2>3. Interactive Particles</h2>
      <canvas 
        ref="particleCanvas" 
        width="600" 
        height="400"
        @mousemove="onParticleMouseMove"
        @mouseleave="resetParticles"
      ></canvas>
    </div>

    <div class="controls">
      <button @click="startAnimation">Start Animation</button>
      <button @click="stopAnimation">Stop Animation</button>
      <button @click="resetAll">Reset All</button>
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
