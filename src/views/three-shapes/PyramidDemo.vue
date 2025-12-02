<template>
  <div class="pyramid-demo">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>

    <div class="controls">
      <label>
        Rotation Speed:
        <input type="range" v-model.number="rotationSpeed" min="0" max="5" step="0.1">
        {{ rotationSpeed }}
      </label>

      <label>
        Base Sides:
        <input type="range" v-model.number="baseSides" min="3" max="12" step="1">
        {{ baseSides }}
      </label>

      <label>
        Height:
        <input type="range" v-model.number="pyramidHeight" min="50" max="300" step="10">
        {{ pyramidHeight }}
      </label>

      <label>
        Base Radius:
        <input type="range" v-model.number="baseRadius" min="30" max="150" step="5">
        {{ baseRadius }}
      </label>

      <label>
        View Distance:
        <input type="range" v-model.number="viewDistance" min="200" max="800" step="20">
        {{ viewDistance }}
      </label>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="showWireframe"> Show Wireframe
        </label>
        <label>
          <input type="checkbox" v-model="showVertices"> Show Vertices
        </label>
        <label>
          <input type="checkbox" v-model="showFaces"> Show Faces
        </label>
        <label>
          <input type="checkbox" v-model="showBase"> Show Base
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="autoRotate"> Auto Rotate
        </label>
        <label>
          <input type="checkbox" v-model="smoothCone"> Smooth Cone Mode
        </label>
      </div>

      <button @click="toggleAnimation">
        {{ isAnimating ? 'Pause' : 'Play' }}
      </button>

      <button @click="resetRotation">Reset Rotation</button>
      <button @click="randomColors">Random Colors</button>
    </div>

    <div class="info">
      <p>Triangular Pyramid with {{ baseSides }}-sided base</p>
      <p>Vertices: {{ vertexCount }} | Edges: {{ edgeCount }} | Faces: {{ faceCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'


// Canvas setup
const canvasRef = ref(null)
const width = 800
const height = 600

// Pyramid parameters
const baseSides = ref(3)
const pyramidHeight = ref(110)
const baseRadius = ref(80)
const rotationSpeed = ref(1)
const viewDistance = ref(800)
const isAnimating = ref(true)
const showWireframe = ref(true)
const showVertices = ref(true)
const showFaces = ref(false)
const showBase = ref(true)
const autoRotate = ref(true)
const smoothCone = ref(false)

let app = null
let pyramidObj = null
let rotation = { x: 0, y: 0, z: 0 }

// Computed properties
const vertexCount = computed(() => {
  return baseSides.value + 1 // base vertices + apex
})

const edgeCount = computed(() => {
  return baseSides.value * 2 // base edges + side edges
})

const faceCount = computed(() => {
  return baseSides.value + (showBase.value ? 1 : 0) // side triangles + base
})

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

// Generate pyramid vertices
function generatePyramidVertices() {
  const vertices = []
  const angleStep = app.math.TAU / baseSides.value

  // Apex vertex (top of pyramid)
  vertices.push([0, 0, pyramidHeight.value / 2])

  // Base vertices
  for (let i = 0; i < baseSides.value; i++) {
    const angle = i * angleStep
    const x = Math.cos(angle) * baseRadius.value
    const y = Math.sin(angle) * baseRadius.value
    vertices.push([x, y, -pyramidHeight.value / 2])
  }

  return vertices
}

// Generate pyramid faces
function generatePyramidFaces() {
  const faces = []
  const apexIndex = 0

  // Side faces (triangles)
  for (let i = 0; i < baseSides.value; i++) {
    const next = (i + 1) % baseSides.value
    const baseIndex1 = i + 1
    const baseIndex2 = next + 1

    faces.push({
      type: 'side',
      indices: [apexIndex, baseIndex1, baseIndex2],
      color: `hsl(${(i * 360) / baseSides.value}, 70%, 60%)`
    })
  }

  // Base face (polygon)
  if (showBase.value) {
    const baseIndices = Array.from({ length: baseSides.value }, (_, i) => i + 1)
    faces.push({
      type: 'base',
      indices: baseIndices,
      color: 'hsl(240, 70%, 60%)'
    })
  }

  return faces
}

// Generate pyramid edges
function generatePyramidEdges() {
  const edges = []
  const apexIndex = 0

  // Side edges (from apex to base vertices)
  for (let i = 0; i < baseSides.value; i++) {
    const baseIndex = i + 1
    edges.push({
      type: 'side',
      indices: [apexIndex, baseIndex],
      color: '#4fc3f7'
    })
  }

  // Base edges
  for (let i = 0; i < baseSides.value; i++) {
    const next = (i + 1) % baseSides.value
    const baseIndex1 = i + 1
    const baseIndex2 = next + 1

    edges.push({
      type: 'base',
      indices: [baseIndex1, baseIndex2],
      color: '#ff6b6b'
    })
  }

  return edges
}

// Calculate face center for depth sorting
function getFaceCenter(face, vertices, projected) {
  let cx = 0, cy = 0, cz = 0
  face.indices.forEach(idx => {
    const vertex = vertices[idx]
    const [rx, ry, rz] = rotate3D(vertex[0], vertex[1], vertex[2], rotation.x, rotation.y, rotation.z)
    const p = projectPoint(rx, ry, rz, viewDistance.value)
    cx += p.x
    cy += p.y
    cz += p.z
  })
  const count = face.indices.length
  return { x: cx / count, y: cy / count, z: cz / count }
}

// HSV to RGB conversion
function hsvToRgb(h, s, v) {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c

  let r, g, b
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else[r, g, b] = [c, 0, x]

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

// Generate random colors
function generateRandomColors() {
  const colors = {}
  const hue1 = Math.random() * 360
  const hue2 = (hue1 + 180) % 360

  colors.side = `hsl(${hue1}, 70%, 60%)`
  colors.base = `hsl(${hue2}, 70%, 60%)`
  colors.wireframe = `hsl(${(hue1 + 90) % 360}, 70%, 70%)`

  return colors
}

// Create the pyramid object
function createPyramid() {
  if (pyramidObj) {
    app.root.remove(pyramidObj)
  }

  const vertices = generatePyramidVertices()
  const faces = generatePyramidFaces()
  const edges = generatePyramidEdges()
  const colors = generateRandomColors()

  pyramidObj = app.root.add({
    vertices,
    faces,
    edges,
    colors,

    update(dt) {
      if (isAnimating.value && autoRotate.value) {
        rotation.y += 0.005 * rotationSpeed.value
        rotation.x += 0.003 * rotationSpeed.value
      }
    },

    draw(ctx) {
      // Project all vertices
      const projected = this.vertices.map(([x, y, z]) => {
        const [rx, ry, rz] = rotate3D(x, y, z, rotation.x, rotation.y, rotation.z)
        return projectPoint(rx, ry, rz, viewDistance.value)
      })

      // Calculate face centers for depth sorting
      const facesWithDepth = this.faces.map(face => ({
        face,
        center: getFaceCenter(face, this.vertices, projected)
      }))

      // Sort faces by depth (painter's algorithm)
      facesWithDepth.sort((a, b) => b.center.z - a.center.z)

      // Draw filled faces
      if (showFaces.value) {
        facesWithDepth.forEach(({ face }) => {
          ctx.fillStyle = face.color
          ctx.beginPath()

          face.indices.forEach((vertexIndex, pointIndex) => {
            const p = projected[vertexIndex]
            if (pointIndex === 0) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          })

          ctx.closePath()
          ctx.fill()
        })
      }

      // Draw wireframe edges
      if (showWireframe.value) {
        // Draw base edges
        ctx.strokeStyle = this.colors.wireframe
        ctx.lineWidth = 2
        ctx.setLineDash([])

        this.edges.forEach(edge => {
          if (edge.type === 'base' && showBase.value) {
            const [i1, i2] = edge.indices
            const p1 = projected[i1], p2 = projected[i2]

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })

        // Draw side edges
        ctx.strokeStyle = this.colors.wireframe
        this.edges.forEach(edge => {
          if (edge.type === 'side') {
            const [i1, i2] = edge.indices
            const p1 = projected[i1], p2 = projected[i2]

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })

        // Draw base polygon outline
        if (showBase.value) {
          ctx.strokeStyle = this.colors.wireframe
          ctx.lineWidth = 3
          ctx.beginPath()

          for (let i = 1; i <= baseSides.value; i++) {
            const p = projected[i]
            if (i === 1) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          }
          ctx.closePath()
          ctx.stroke()
        }
      }

      // Draw vertices
      if (showVertices.value) {
        // Apex vertex
        ctx.fillStyle = '#ffeb3b'
        const apex = projected[0]
        ctx.beginPath()
        ctx.arc(apex.x, apex.y, 4, 0, app.math.TAU)
        ctx.fill()

        // Base vertices
        ctx.fillStyle = '#4fc3f7'
        for (let i = 1; i < projected.length; i++) {
          const p = projected[i]
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, app.math.TAU)
          ctx.fill()
        }
      }

      // Draw labels for important points
      this.drawLabels(ctx, projected)
    },

    drawLabels(ctx, projected) {
      ctx.fillStyle = '#fff'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Label apex
      const apex = projected[0]
      ctx.fillText('Apex', apex.x, apex.y - 15)

      // Label some base vertices
      if (baseSides.value <= 8) {
        for (let i = 1; i < Math.min(4, projected.length); i++) {
          const p = projected[i]
          ctx.fillText(`V${i}`, p.x, p.y + 15)
        }
      }
    }
  })

  return pyramidObj
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
    autoRotate.value = false
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
    // isAnimating.value = false;
  })

  canvasRef.value.addEventListener('mouseleave', () => {
    isDragging = false
    canvasRef.value.style.cursor = 'default'
    // isAnimating.value = false;

    toggleAnimation()
  })

  canvasRef.value.style.cursor = 'grab'
  // isAnimating.value = true;
}

// Initialize
onMounted(() => {
  app = createCanvasApp(canvasRef.value)
  app.use(mathPlugin)

  createPyramid()
  setupMouseControl()
})

// Cleanup
onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

// Watch for parameter changes
watch([baseSides, pyramidHeight, baseRadius, showBase], () => {
  if (app && pyramidObj) {
    createPyramid()
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

function randomColors() {
  if (pyramidObj) {
    pyramidObj.colors = generateRandomColors()
  }
}
</script>

<style scoped>
.pyramid-demo {
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
  margin: 2px;
}

.controls button:hover {
  background: #1976d2;
}

.info {
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  text-align: center;
  font-family: monospace;
}

.info p {
  margin: 5px 0;
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
