<template>
  <div class="sphere-demo">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>

    <div class="controls">
      <label>
        Rotation Speed:
        <input type="range" v-model.number="rotationSpeed" min="0" max="5" step="0.1">
        {{ rotationSpeed }}
      </label>

      <label>
        Longitude Lines:
        <input type="range" v-model.number="longitudeSegments" min="4" max="32" step="2">
        {{ longitudeSegments }}
      </label>

      <label>
        Latitude Lines:
        <input type="range" v-model.number="latitudeSegments" min="4" max="24" step="2">
        {{ latitudeSegments }}
      </label>

      <label>
        Sphere Radius:
        <input type="range" v-model.number="radius" min="30" max="150" step="5">
        {{ radius }}
      </label>

      <label>
        View Distance:
        <input type="range" v-model.number="viewDistance" min="200" max="800" step="20">
        {{ viewDistance }}
      </label>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="showVertices"> Show Vertices
        </label>
        <label>
          <input type="checkbox" v-model="showLatitude"> Show Latitude
        </label>
        <label>
          <input type="checkbox" v-model="showLongitude"> Show Longitude
        </label>
      </div>

      <button @click="toggleAnimation">
        {{ isAnimating ? 'Pause' : 'Play' }}
      </button>

      <button @click="resetRotation">Reset Rotation</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

// Canvas setup
const canvasRef = ref(null)
const width = 800
const height = 600

// Sphere parameters
const longitudeSegments = ref(12)
const latitudeSegments = ref(8)
const radius = ref(80)
const rotationSpeed = ref(1)
const viewDistance = ref(400)
const isAnimating = ref(true)
const showVertices = ref(true)
const showLatitude = ref(true)
const showLongitude = ref(true)

let app = null
let sphereObj = null
let rotation = { x: 0, y: 0, z: 0 }

// 3D point projection using perspective
function projectPoint(x, y, z, viewDist) {
  const scale = viewDist / (viewDist + z)
  return {
    x: width / 2 + x * scale,
    y: height / 2 + y * scale,
    z: z // Keep z for depth sorting
  }
}

// Apply 3D rotation transformations
function rotate3D(x, y, z, rx, ry, rz) {
  // Rotate around X axis
  let y1 = y * Math.cos(rx) - z * Math.sin(rx)
  let z1 = y * Math.sin(rx) + z * Math.cos(rx)

  // Rotate around Y axis
  let x2 = x * Math.cos(ry) + z1 * Math.sin(ry)
  let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)

  // Rotate around Z axis
  let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz)
  let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz)

  return [x3, y3, z2]
}

// Generate sphere vertices using longitude/latitude method
function generateSphereVertices() {
  const vertices = []
  const indices = []

  const phiSteps = latitudeSegments.value
  const thetaSteps = longitudeSegments.value

  // Generate vertices
  for (let i = 0; i <= phiSteps; i++) {
    const phi = (i / phiSteps) * Math.PI // 0 to PI (latitude)
    const sinPhi = Math.sin(phi)
    const cosPhi = Math.cos(phi)

    for (let j = 0; j <= thetaSteps; j++) {
      const theta = (j / thetaSteps) * app.math.TAU // 0 to 2PI (longitude)
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      const x = radius.value * sinPhi * cosTheta
      const y = radius.value * sinPhi * sinTheta
      const z = radius.value * cosPhi

      vertices.push([x, y, z])
    }
  }

  return vertices
}

// Generate longitude lines (meridians)
function generateLongitudeLines(vertices) {
  const lines = []
  const phiSteps = latitudeSegments.value
  const thetaSteps = longitudeSegments.value

  for (let j = 0; j <= thetaSteps; j++) {
    const line = []
    for (let i = 0; i <= phiSteps; i++) {
      const index = i * (thetaSteps + 1) + j
      line.push(index)
    }
    lines.push(line)
  }

  return lines
}

// Generate latitude lines (parallels)
function generateLatitudeLines(vertices) {
  const lines = []
  const phiSteps = latitudeSegments.value
  const thetaSteps = longitudeSegments.value

  for (let i = 0; i <= phiSteps; i++) {
    const line = []
    for (let j = 0; j <= thetaSteps; j++) {
      const index = i * (thetaSteps + 1) + j
      line.push(index)
    }
    lines.push(line)
  }

  return lines
}

// Create the sphere object
function createSphere() {
  if (sphereObj) {
    app.root.remove(sphereObj)
  }

  sphereObj = app.root.add({
    vertices: generateSphereVertices(),
    longitudeLines: [],
    latitudeLines: [],

    update(dt) {
      if (isAnimating.value) {
        rotation.y += 0.005 * rotationSpeed.value
        rotation.x += 0.003 * rotationSpeed.value
      }
    },

    draw(ctx) {
      // Generate current vertices and lines
      this.vertices = generateSphereVertices()
      this.longitudeLines = generateLongitudeLines(this.vertices)
      this.latitudeLines = generateLatitudeLines(this.vertices)

      // Apply rotation and project all vertices
      const projected = this.vertices.map(([x, y, z]) => {
        const [rx, ry, rz] = rotate3D(x, y, z, rotation.x, rotation.y, rotation.z)
        return projectPoint(rx, ry, rz, viewDistance.value)
      })

      // Set line styles
      ctx.strokeStyle = '#4fc3f7'
      ctx.lineWidth = 1.5
      ctx.fillStyle = '#fff'

      // Draw longitude lines (meridians)
      if (showLongitude.value) {
        ctx.strokeStyle = '#4fc3f7'
        this.longitudeLines.forEach(line => {
          ctx.beginPath()
          line.forEach((vertexIndex, pointIndex) => {
            const p = projected[vertexIndex]
            if (pointIndex === 0) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          })
          ctx.stroke()
        })
      }

      // Draw latitude lines (parallels)
      if (showLatitude.value) {
        ctx.strokeStyle = '#ff6b6b'
        this.latitudeLines.forEach(line => {
          ctx.beginPath()
          line.forEach((vertexIndex, pointIndex) => {
            const p = projected[vertexIndex]
            if (pointIndex === 0) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          })
          ctx.stroke()
        })
      }

      // Draw vertices as dots
      if (showVertices.value) {
        ctx.fillStyle = '#fff'
        projected.forEach(p => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, app.math.TAU)
          ctx.fill()
        })
      }

      // Draw axis indicators
      this.drawAxes(ctx, projected)
    },

    drawAxes(ctx, projected) {
      // Draw simple axis lines at origin
      ctx.save()
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])

      // X axis (red)
      ctx.strokeStyle = '#ff4444'
      ctx.beginPath()
      const origin = projectPoint(0, 0, 0, viewDistance.value)
      const xAxis = projectPoint(radius.value * 1.5, 0, 0, viewDistance.value)
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(xAxis.x, xAxis.y)
      ctx.stroke()

      // Y axis (green)
      ctx.strokeStyle = '#44ff44'
      ctx.beginPath()
      const yAxis = projectPoint(0, radius.value * 1.5, 0, viewDistance.value)
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(yAxis.x, yAxis.y)
      ctx.stroke()

      // Z axis (blue)
      ctx.strokeStyle = '#4444ff'
      ctx.beginPath()
      const zAxis = projectPoint(0, 0, radius.value * 1.5, viewDistance.value)
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(zAxis.x, zAxis.y)
      ctx.stroke()

      ctx.restore()
    }
  })

  return sphereObj
}

// Mouse interaction for manual rotation
function setupMouseControl() {
  let isDragging = false
  let lastX = 0
  let lastY = 0

  canvasRef.value.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    isAnimating.value = false
    canvasRef.value.style.cursor = 'grabbing'
  })

  canvasRef.value.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY

    rotation.y += dx * 0.01
    rotation.x += dy * 0.01

    lastX = e.clientX
    lastY = e.clientY
  })

  canvasRef.value.addEventListener('mouseup', () => {
    isDragging = false
    canvasRef.value.style.cursor = 'grab'
  })

  canvasRef.value.addEventListener('mouseleave', () => {
    isDragging = false
    canvasRef.value.style.cursor = 'default'
  })

  canvasRef.value.style.cursor = 'grab'
}

// Initialize
onMounted(() => {
  app = createCanvasApp(canvasRef.value)
  app.use(mathPlugin)

  createSphere()
  setupMouseControl()
})

// Cleanup
onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

// Watch for parameter changes
watch([longitudeSegments, latitudeSegments, radius], () => {
  if (app && sphereObj) {
    createSphere()
  }
})

function toggleAnimation() {
  isAnimating.value = !isAnimating.value
}

function resetRotation() {
  rotation.x = 0
  rotation.y = 0
  rotation.z = 0
}
</script>

<style scoped>
.sphere-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 10px;
  color: white;
}

canvas {
  border: 2px solid #333;
  border-radius: 8px;
  background: #000;
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
  max-width: 800px;
}

.controls label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.controls input[type="range"] {
  width: 120px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.checkbox-group label {
  flex-direction: row;
  font-size: 12px;
}

.controls button {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.controls button:hover {
  background: #1976d2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .controls label {
    align-items: stretch;
  }

  .checkbox-group {
    align-items: center;
  }
}
</style>
