<template>
  <div class="wave-container">
    <canvas ref="canvas" :width="width" :height="height"></canvas>
    <div class="controls">
      <button @click="regenerateWave">New Wave</button>
      <button @click="toggleAnimation">
        {{ isAnimating ? 'Pause' : 'Animate' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Canvas dimensions
const width = 800
const height = 600

// Refs
const canvas = ref(null)
const isAnimating = ref(false)
let ctx = null
let animationId = null
let startTime = Date.now()

// Wave parameters
const waveParams = ref({
  waveCount: 3,
  waveAmplitude: 60,
  waveLength: 200,
  waveSpeed: 2,
  foamIntensity: 25,
  colorDeep: '#1a237e',
  colorMid: '#283593',
  colorLight: '#303f9f',
  foamColor: '#e3f2fd'
})

// Initialize canvas
onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    drawScene(0)
  }
})

// Cleanup
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

// Watch for wave parameter changes
watch(waveParams, () => {
  if (!isAnimating.value) {
    drawScene(0)
  }
}, { deep: true })

// Main drawing function
function drawScene(time) {
  if (!ctx) return
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Draw sky
  drawSky()
  
  // Draw sea background
  drawSea()
  
  // Draw Mount Fuji
  drawMountFuji()
  
  // Draw waves (back to front)
  for (let i = waveParams.value.waveCount - 1; i >= 0; i--) {
    drawWave(i, time)
  }
  
  // Draw seagulls
  drawSeagulls(time)
}

// Draw sky gradient
function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6)
  gradient.addColorStop(0, '#bbdefb')
  gradient.addColorStop(0.7, '#90caf9')
  gradient.addColorStop(1, '#64b5f6')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height * 0.6)
}

// Draw sea background
function drawSea() {
  const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height)
  gradient.addColorStop(0, waveParams.value.colorLight)
  gradient.addColorStop(0.5, waveParams.value.colorMid)
  gradient.addColorStop(1, waveParams.value.colorDeep)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, height * 0.6, width, height * 0.4)
}

// Draw Mount Fuji silhouette
function drawMountFuji() {
  ctx.save()
  ctx.globalAlpha = 0.3
  
  ctx.fillStyle = '#78909c'
  ctx.strokeStyle = '#546e7a'
  ctx.lineWidth = 2
  
  ctx.beginPath()
  ctx.moveTo(width * 0.3, height * 0.8)
  ctx.lineTo(width * 0.5, height * 0.3)
  ctx.lineTo(width * 0.7, height * 0.8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // Snow cap
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(width * 0.5, height * 0.3)
  ctx.lineTo(width * 0.48, height * 0.4)
  ctx.lineTo(width * 0.52, height * 0.4)
  ctx.closePath()
  ctx.fill()
  
  ctx.restore()
}

// Draw individual wave
function drawWave(waveIndex, time) {
  const waveSpacing = height * 0.4 / (waveParams.value.waveCount + 1)
  const baseY = height * 0.6 + waveSpacing * (waveIndex + 1)
  const amplitude = waveParams.value.waveAmplitude * (1 - waveIndex * 0.2)
  const wavelength = waveParams.value.waveLength * (1 + waveIndex * 0.3)
  const speed = waveParams.value.waveSpeed * (1 - waveIndex * 0.1)
  
  // Generate wave points
  const wavePoints = []
  const foamPoints = []
  
  for (let x = -50; x <= width + 50; x += 5) {
    const offset = time * speed
    const y = baseY + Math.sin((x + offset) / wavelength * Math.PI * 2) * amplitude
    wavePoints.push({ x, y })
    
    const foamY = y - 8 - Math.abs(Math.cos((x + offset) / wavelength * Math.PI * 2)) * 5
    foamPoints.push({ x, y: foamY })
  }
  
  // Draw wave body
  drawWaveBody(wavePoints, baseY, amplitude)
  
  // Draw foam crest
  drawFoamCrest(foamPoints, waveIndex)
  
  // Draw spray on front wave
  if (waveIndex === 0) {
    drawSpray(wavePoints, time)
  }
}

// Draw wave body with gradient
function drawWaveBody(points, baseY, amplitude) {
  const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, baseY + amplitude)
  gradient.addColorStop(0, waveParams.value.colorLight)
  gradient.addColorStop(0.5, waveParams.value.colorMid)
  gradient.addColorStop(1, waveParams.value.colorDeep)
  
  ctx.fillStyle = gradient
  ctx.strokeStyle = waveParams.value.colorDeep
  ctx.lineWidth = 2
  
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  
  ctx.lineTo(width + 50, height)
  ctx.lineTo(-50, height)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

// Draw foam crest on wave
function drawFoamCrest(points, waveIndex) {
  ctx.save()
  
  // Main foam line
  ctx.strokeStyle = waveParams.value.foamColor
  ctx.lineWidth = 4 - waveIndex * 0.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  
  ctx.stroke()
  
  // Foam particles
  const density = waveParams.value.foamIntensity * (1 - waveIndex * 0.3)
  
  for (let i = 0; i < density; i++) {
    const pointIndex = Math.floor(Math.random() * points.length)
    const point = points[pointIndex]
    
    if (Math.random() > 0.4) {
      const size = 1 + Math.random() * 3
      const offsetY = Math.random() * 10 - 5
      
      ctx.globalAlpha = 0.6 + Math.random() * 0.4
      ctx.fillStyle = waveParams.value.foamColor
      
      ctx.beginPath()
      ctx.arc(point.x, point.y + offsetY, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  ctx.restore()
}

// Draw spray particles
function drawSpray(points, time) {
  ctx.save()
  ctx.fillStyle = waveParams.value.foamColor
  
  for (let i = 20; i < points.length - 20; i += 10) {
    const point = points[i]
    const prevPoint = points[i - 1]
    const nextPoint = points[i + 1]
    
    // Check if this is a peak
    if (point.y < prevPoint.y && point.y < nextPoint.y) {
      const sprayCount = 3 + Math.floor(Math.random() * 5)
      
      for (let j = 0; j < sprayCount; j++) {
        const sprayX = point.x + (Math.random() - 0.5) * 30
        const sprayY = point.y - 15 - Math.random() * 25
        const size = 1 + Math.random() * 3
        
        ctx.globalAlpha = 0.5 + Math.random() * 0.3
        
        ctx.beginPath()
        ctx.arc(sprayX, sprayY, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  
  ctx.restore()
}

// Draw seagulls
function drawSeagulls(time) {
  ctx.save()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.8
  
  const seagullCount = 5
  
  for (let i = 0; i < seagullCount; i++) {
    const x = (width / (seagullCount + 1)) * (i + 1)
    const y = height * 0.15 + Math.sin(time * 0.001 + i * 2) * 15
    const wingFlap = Math.sin(time * 0.003 + i) * 8
    
    // Left wing
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x - 20, y - 12 - wingFlap, x - 12, y - 6 - wingFlap)
    ctx.stroke()
    
    // Right wing
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 20, y - 12 - wingFlap, x + 12, y - 6 - wingFlap)
    ctx.stroke()
  }
  
  ctx.restore()
}

// Animation loop
function animate() {
  if (!isAnimating.value) return
  
  const elapsed = Date.now() - startTime
  drawScene(elapsed)
  
  animationId = requestAnimationFrame(animate)
}

// Toggle animation
function toggleAnimation() {
  isAnimating.value = !isAnimating.value
  
  if (isAnimating.value) {
    startTime = Date.now()
    animate()
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

// Regenerate wave with random parameters
function regenerateWave() {
  waveParams.value = {
    waveCount: 2 + Math.floor(Math.random() * 3),
    waveAmplitude: 40 + Math.random() * 50,
    waveLength: 150 + Math.random() * 150,
    waveSpeed: 1 + Math.random() * 2.5,
    foamIntensity: 15 + Math.random() * 20,
    colorDeep: `hsl(${220 + Math.random() * 20}, ${60 + Math.random() * 20}%, ${25 + Math.random() * 10}%)`,
    colorMid: `hsl(${220 + Math.random() * 20}, ${50 + Math.random() * 20}%, ${35 + Math.random() * 10}%)`,
    colorLight: `hsl(${220 + Math.random() * 20}, ${45 + Math.random() * 20}%, ${45 + Math.random() * 10}%)`,
    foamColor: '#e3f2fd'
  }
  
  drawScene(0)
}
</script>

<style scoped>
.wave-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

canvas {
  border: 3px solid #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: #f5f5f5;
}

.controls {
  display: flex;
  gap: 15px;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
