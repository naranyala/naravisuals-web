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
        Subdivisions:
        <input type="range" v-model.number="subdivisions" min="0" max="4" step="1">
        {{ subdivisions }}
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
          <input type="checkbox" v-model="showWireframe"> Show Wireframe
        </label>
        <label>
          <input type="checkbox" v-model="showVertices"> Show Vertices
        </label>
        <label>
          <input type="checkbox" v-model="showFaces"> Show Faces
        </label>
        <label>
          <input type="checkbox" v-model="smoothShading"> Smooth Shading
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="autoRotate"> Auto Rotate
        </label>
        <label>
          <input type="checkbox" v-model="showStats"> Show Stats
        </label>
      </div>

      <button @click="toggleAnimation">
        {{ isAnimating ? 'Pause' : 'Play' }}
      </button>

      <button @click="resetRotation">Reset Rotation</button>
      <button @click="randomColors">Random Colors</button>
    </div>

    <div v-if="showStats" class="stats">
      Vertices: {{ vertexCount }} | Triangles: {{ triangleCount }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, watchEffect } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

// Canvas setup
const canvasRef = ref(null)
const width = 800
const height = 600

// Sphere parameters
const subdivisions = ref(1)
const radius = ref(80)
const rotationSpeed = ref(1)
const viewDistance = ref(400)
const isAnimating = ref(true)
const showWireframe = ref(true)
const showVertices = ref(true)
const showFaces = ref(false)
const smoothShading = ref(false)
const autoRotate = ref(true)
const showStats = ref(false)

let app = null
let sphereObj = null
let rotation = { x: 0, y: 0, z: 0 }

// Computed stats
const vertexCount = computed(() => {
  // Base icosahedron has 12 vertices
  // Each subdivision multiplies faces by 4
  const baseVertices = 12
  const baseFaces = 20
  let vertices = baseVertices
  let faces = baseFaces

  for (let i = 0; i < subdivisions.value; i++) {
    vertices = vertices + faces * 3 / 2
    faces = faces * 4
  }

  return vertices
})

const triangleCount = computed(() => {
  return 20 * Math.pow(4, subdivisions.value)
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

// Normalize vector to unit length
function normalizeVector(x, y, z) {
  const length = Math.sqrt(x * x + y * y + z * z)
  return [x / length, y / length, z / length]
}

// Create icosahedron vertices (12 vertices)
function createIcosahedron() {
  const t = (1 + Math.sqrt(5)) / 2 // Golden ratio
  const vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ]

  // Normalize all vertices to unit sphere
  return vertices.map(([x, y, z]) => normalizeVector(x, y, z))
}

// Icosahedron faces (20 triangles)
function createIcosahedronFaces() {
  return [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ]
}

// Subdivide triangle into 4 smaller triangles
function subdivideTriangle(v1, v2, v3, depth) {
  if (depth === 0) {
    return [[v1, v2, v3]]
  }

  // Calculate midpoints
  const m12 = normalizeVector(
    (v1[0] + v2[0]) / 2,
    (v1[1] + v2[1]) / 2,
    (v1[2] + v2[2]) / 2
  )
  const m23 = normalizeVector(
    (v2[0] + v3[0]) / 2,
    (v2[1] + v3[1]) / 2,
    (v2[2] + v3[2]) / 2
  )
  const m31 = normalizeVector(
    (v3[0] + v1[0]) / 2,
    (v3[1] + v1[1]) / 2,
    (v3[2] + v1[2]) / 2
  )

  // Recursively subdivide the 4 new triangles
  const triangles = []
  triangles.push(...subdivideTriangle(v1, m12, m31, depth - 1))
  triangles.push(...subdivideTriangle(m12, v2, m23, depth - 1))
  triangles.push(...subdivideTriangle(m31, m23, v3, depth - 1))
  triangles.push(...subdivideTriangle(m12, m23, m31, depth - 1))

  return triangles
}

// Generate sphere geometry
function generateSphereGeometry() {
  const baseVertices = createIcosahedron()
  const baseFaces = createIcosahedronFaces()

  let triangles = []

  // Subdivide each face
  baseFaces.forEach(face => {
    const v1 = baseVertices[face[0]]
    const v2 = baseVertices[face[1]]
    const v3 = baseVertices[face[2]]

    triangles.push(...subdivideTriangle(v1, v2, v3, subdivisions.value))
  })

  // Scale vertices by radius
  const vertices = triangles.flat().map(([x, y, z]) => [
    x * radius.value,
    y * radius.value,
    z * radius.value
  ])

  // Create triangle indices
  const indices = []
  for (let i = 0; i < vertices.length; i += 3) {
    indices.push([i, i + 1, i + 2])
  }

  return { vertices, indices }
}

// Calculate face normal for flat shading
function calculateFaceNormal(v1, v2, v3) {
  const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]]
  const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]]

  const normal = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ]

  return normalizeVector(...normal)
}

// Calculate vertex normal for smooth shading
function calculateVertexNormals(vertices, indices) {
  const normals = new Array(vertices.length).fill().map(() => [0, 0, 0])

  indices.forEach(triangle => {
    const [i1, i2, i3] = triangle
    const v1 = vertices[i1], v2 = vertices[i2], v3 = vertices[i3]
    const faceNormal = calculateFaceNormal(v1, v2, v3)

    // Add face normal to each vertex
    for (let i = 0; i < 3; i++) {
      const idx = triangle[i]
      normals[idx][0] += faceNormal[0]
      normals[idx][1] += faceNormal[1]
      normals[idx][2] += faceNormal[2]
    }
  })

  // Normalize all vertex normals
  return normals.map(normal => normalizeVector(...normal))
}

// Generate colors for triangles
function generateColors(triangleCount) {
  const colors = []
  const hueStep = 360 / triangleCount

  for (let i = 0; i < triangleCount; i++) {
    const hue = (i * hueStep) % 360
    const [r, g, b] = hsvToRgb(hue, 70, 80)
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }

  return colors
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

// Create the sphere object
function createSphere() {
  if (sphereObj) {
    app.root.remove(sphereObj)
  }

  const geometry = generateSphereGeometry()
  const colors = generateColors(geometry.indices.length)
  const vertexNormals = calculateVertexNormals(geometry.vertices, geometry.indices)

  sphereObj = app.root.add({
    geometry,
    colors,
    vertexNormals,
    faceColors: [],

    update(dt) {
      if (isAnimating.value && autoRotate.value) {
        rotation.y += 0.005 * rotationSpeed.value
        rotation.x += 0.003 * rotationSpeed.value
      }
    },

    draw(ctx) {
      // Project all vertices
      const projected = geometry.vertices.map(([x, y, z]) => {
        const [rx, ry, rz] = rotate3D(x, y, z, rotation.x, rotation.y, rotation.z)
        return projectPoint(rx, ry, rz, viewDistance.value)
      })

      // Calculate face centers and prepare for depth sorting
      const facesWithDepth = geometry.indices.map((triangle, faceIndex) => {
        const [i1, i2, i3] = triangle
        const p1 = projected[i1], p2 = projected[i2], p3 = projected[i3]

        // Calculate face center for depth sorting
        const centerZ = (p1.z + p2.z + p3.z) / 3

        return {
          triangle,
          faceIndex,
          centerZ,
          vertices: [p1, p2, p3]
        }
      })

      // Sort faces by depth (painter's algorithm)
      facesWithDepth.sort((a, b) => b.centerZ - a.centerZ)

      // Draw faces
      if (showFaces.value) {
        facesWithDepth.forEach(({ triangle, faceIndex, vertices }) => {
          const [p1, p2, p3] = vertices

          // Calculate lighting (simple directional light)
          let intensity = 0.7
          if (smoothShading.value) {
            // Average vertex normals for smooth shading
            const [i1, i2, i3] = triangle
            const n1 = this.vertexNormals[i1]
            const n2 = this.vertexNormals[i2]
            const n3 = this.vertexNormals[i3]
            const lightDir = [0.5, 0.5, 1] // Light direction
            const dot1 = n1[0] * lightDir[0] + n1[1] * lightDir[1] + n1[2] * lightDir[2]
            const dot2 = n2[0] * lightDir[0] + n2[1] * lightDir[1] + n2[2] * lightDir[2]
            const dot3 = n3[0] * lightDir[0] + n3[1] * lightDir[1] + n3[2] * lightDir[2]
            intensity = (dot1 + dot2 + dot3) / 3 * 0.5 + 0.5
          } else {
            // Flat shading - use face normal
            const v1 = geometry.vertices[triangle[0]]
            const v2 = geometry.vertices[triangle[1]]
            const v3 = geometry.vertices[triangle[2]]
            const normal = calculateFaceNormal(v1, v2, v3)
            const lightDir = [0.5, 0.5, 1]
            const dot = normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2]
            intensity = dot * 0.5 + 0.5
          }

          intensity = Math.max(0.2, Math.min(1, intensity))

          // Apply lighting to color
          const baseColor = this.colors[faceIndex % this.colors.length]
          const litColor = baseColor.replace('rgb(', `rgba(`).replace(')', `, ${intensity})`)

          ctx.fillStyle = litColor
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(p3.x, p3.y)
          ctx.closePath()
          ctx.fill()
        })
      }

      // Draw wireframe
      if (showWireframe.value) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 1
        ctx.setLineDash([])

        facesWithDepth.forEach(({ vertices }) => {
          const [p1, p2, p3] = vertices
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(p3.x, p3.y)
          ctx.closePath()
          ctx.stroke()
        })
      }

      // Draw vertices
      if (showVertices.value) {
        ctx.fillStyle = '#fff'
        projected.forEach(p => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, app.math.TAU)
          ctx.fill()
        })
      }
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
    isAnimating.value = false
  })

  canvasRef.value.addEventListener('mouseleave', () => {
    isDragging = false
    canvasRef.value.style.cursor = 'default'
    isAnimating.value = true
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

watchEffect(() => {
  console.log("isAnimating: ", isAnimating.value)
})

// Watch for parameter changes
watch([subdivisions, radius], () => {
  if (app && sphereObj) {
    createSphere()
  }
})

function toggleAnimation() {
  if (isAnimating.value) {
    isAnimating.value = false
  } else {
    isAnimating.value = true
  }
}

function resetRotation() {
  rotation.x = 0
  rotation.y = 0
  rotation.z = 0
}

function randomColors() {
  if (sphereObj) {
    sphereObj.colors = generateColors(sphereObj.geometry.indices.length)
  }
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
  margin: 2px;
}

.controls button:hover {
  background: #1976d2;
}

.stats {
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  font-family: monospace;
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
