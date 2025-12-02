<template>
  <div class="prism-demo">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>

    <div class="controls">
      <label>
        Rotation Speed:
        <input type="range" v-model.number="rotationSpeed" min="0" max="5" step="0.1">
        {{ rotationSpeed }}
      </label>

      <label>
        Prism Sides:
        <input type="range" v-model.number="sides" min="3" max="12" step="1">
        {{ sides }}
      </label>

      <label>
        Height:
        <input type="range" v-model.number="prismHeight" min="50" max="300" step="10">
        {{ prismHeight }}
      </label>

      <label>
        Radius:
        <input type="range" v-model.number="radius" min="50" max="200" step="10">
        {{ radius }}
      </label>

      <label>
        View Distance:
        <input type="range" v-model.number="viewDistance" min="200" max="600" step="20">
        {{ viewDistance }}
      </label>

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

// Prism parameters
const sides = ref(6)
const prismHeight = ref(150)
const radius = ref(100)
const rotationSpeed = ref(1)
const viewDistance = ref(300)
const isAnimating = ref(true)

let app = null
let prismObj = null
let rotation = { x: 0, y: 0 }

// 3D point projection using perspective
function projectPoint(x, y, z, viewDist) {
  const scale = viewDist / (viewDist + z)
  return {
    x: width / 2 + x * scale,
    y: height / 2 + y * scale,
    z: z // Keep z for depth sorting
  }
}

// Generate prism vertices in 3D space
function generatePrismVertices() {
  const vertices = []
  const angleStep = app.math.TAU / sides.value

  // Bottom face vertices
  for (let i = 0; i < sides.value; i++) {
    const angle = i * angleStep
    const x = Math.cos(angle) * radius.value
    const y = Math.sin(angle) * radius.value
    vertices.push(app.vec2(x, y).toArray().concat([-prismHeight.value / 2]))
  }

  // Top face vertices
  for (let i = 0; i < sides.value; i++) {
    const angle = i * angleStep
    const x = Math.cos(angle) * radius.value
    const y = Math.sin(angle) * radius.value
    vertices.push(app.vec2(x, y).toArray().concat([prismHeight.value / 2]))
  }

  return vertices
}

// Apply 3D rotation transformations
function rotate3D(x, y, z, rx, ry) {
  // Rotate around X axis
  let y1 = y * Math.cos(rx) - z * Math.sin(rx)
  let z1 = y * Math.sin(rx) + z * Math.cos(rx)

  // Rotate around Y axis
  let x2 = x * Math.cos(ry) + z1 * Math.sin(ry)
  let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)

  return [x2, y1, z2]
}

// Create faces for depth sorting
function generateFaces(vertices) {
  const faces = []
  const n = sides.value

  // Bottom face
  faces.push({
    indices: Array.from({ length: n }, (_, i) => i),
    color: 'rgba(79, 195, 247, 0.3)'
  })

  // Top face
  faces.push({
    indices: Array.from({ length: n }, (_, i) => n + i),
    color: 'rgba(79, 195, 247, 0.4)'
  })

  // Side faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    faces.push({
      indices: [i, next, n + next, n + i],
      color: `rgba(${50 + i * 20}, ${150 + i * 10}, 243, 0.25)`
    })
  }

  return faces
}

// Calculate face center for depth sorting
function getFaceCenter(face, projected) {
  let cx = 0, cy = 0, cz = 0
  face.indices.forEach(idx => {
    cx += projected[idx].x
    cy += projected[idx].y
    cz += projected[idx].z
  })
  const count = face.indices.length
  return { x: cx / count, y: cy / count, z: cz / count }
}

// Create the prism object
function createPrism() {
  if (prismObj) {
    app.root.remove(prismObj)
  }

  prismObj = app.root.add({
    vertices: generatePrismVertices(),

    update(dt) {
      if (isAnimating.value) {
        rotation.y += 0.01 * rotationSpeed.value
      }
    },

    draw(ctx) {
      // Generate current vertices
      this.vertices = generatePrismVertices()

      // Apply rotation and project
      const projected = this.vertices.map(([x, y, z]) => {
        const [rx, ry, rz] = rotate3D(x, y, z, rotation.x, rotation.y)
        return projectPoint(rx, ry, rz, viewDistance.value)
      })

      // Generate faces
      const faces = generateFaces(this.vertices)

      // Calculate face centers and sort by depth (painter's algorithm)
      const facesWithDepth = faces.map(face => ({
        face,
        center: getFaceCenter(face, projected)
      }))

      // Sort faces by z-depth (farthest first)
      facesWithDepth.sort((a, b) => a.center.z - b.center.z)

      // Draw filled faces
      facesWithDepth.forEach(({ face }) => {
        ctx.fillStyle = face.color
        ctx.beginPath()
        face.indices.forEach((idx, i) => {
          if (i === 0) {
            ctx.moveTo(projected[idx].x, projected[idx].y)
          } else {
            ctx.lineTo(projected[idx].x, projected[idx].y)
          }
        })
        ctx.closePath()
        ctx.fill()
      })

      // Draw wireframe edges
      const n = sides.value
      ctx.strokeStyle = '#4fc3f7'
      ctx.lineWidth = 2

      // Bottom face edges
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n
        ctx.moveTo(projected[i].x, projected[i].y)
        ctx.lineTo(projected[next].x, projected[next].y)
      }
      ctx.stroke()

      // Top face edges
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n
        ctx.moveTo(projected[n + i].x, projected[n + i].y)
        ctx.lineTo(projected[n + next].x, projected[n + next].y)
      }
      ctx.stroke()

      // Connecting edges
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        ctx.moveTo(projected[i].x, projected[i].y)
        ctx.lineTo(projected[n + i].x, projected[n + i].y)
      }
      ctx.stroke()

      // Draw vertices as dots
      ctx.fillStyle = '#fff'
      projected.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, app.math.TAU)
        ctx.fill()
      })
    }
  })

  return prismObj
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
  })

  canvasRef.value.addEventListener('mouseleave', () => {
    isDragging = false
  })
}

// Initialize
onMounted(() => {
  app = createCanvasApp(canvasRef.value)
  app.use(mathPlugin)

  createPrism()
  setupMouseControl()
})

// Cleanup
onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

// Watch for parameter changes
watch([sides, prismHeight, radius], () => {
  if (app && prismObj) {
    createPrism()
  }
})

function toggleAnimation() {
  isAnimating.value = !isAnimating.value
}

function resetRotation() {
  rotation.x = 0
  rotation.y = 0
}
</script>

<style scoped>
.prism-demo {
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
</style>
