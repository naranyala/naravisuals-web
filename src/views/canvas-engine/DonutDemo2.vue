<template>
  <div class="donut-demo">
    <h2>3D Donut Demo</h2>
    <div class="controls">
      <label>
        Rotation Speed:
        <input type="range" v-model="rotationSpeed" min="0" max="5" step="0.1">
        {{ rotationSpeed }}
      </label>
      <label>
        Donut Thickness:
        <input type="range" v-model="donutThickness" min="0.1" max="2" step="0.1">
        {{ donutThickness }}
      </label>
      <label>
        Show Wireframe:
        <input type="checkbox" v-model="showWireframe">
      </label>
      <label>
        Auto Rotate:
        <input type="checkbox" v-model="autoRotate">
      </label>
    </div>
    <canvas ref="canvasEl" width="800" height="600"></canvas>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'


const canvasEl = ref(null)
let app = null
let donut = null

// Reactive controls
const rotationSpeed = ref(1.0)
const donutThickness = ref(0.8)
const showWireframe = ref(false)
const autoRotate = ref(true)

// Donut parameters
const R = 1.5  // Major radius
const r = 0.6  // Minor radius
const segments = 40
const rings = 30

// Initialize the donut demo
const initDonut = () => {
  if (!canvasEl.value) return

  // Create canvas app
  app = createCanvasApp(canvasEl.value)
  app.use(mathPlugin)

  // Create donut object
  donut = app.root.add({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    points: [],
    wireframe: showWireframe.value,
    thickness: donutThickness.value,

    update(dt) {
      if (autoRotate.value) {
        // Auto-rotate the donut around multiple axes
        this.rotationY += (dt / 1000) * rotationSpeed.value
        this.rotationX += (dt / 1000) * rotationSpeed.value * 0.7
      }
    },

    draw(ctx) {
      if (!this.points.length) return

      ctx.strokeStyle = this.wireframe ? '#ff6b6b' : '#4ecdc4'
      ctx.fillStyle = '#45b7aa'
      ctx.lineWidth = 1

      // Project 3D points to 2D
      const projected = this.points.map(p => this.project3D(p))

      if (this.wireframe) {
        // Draw wireframe
        this.drawWireframe(ctx, projected)
      } else {
        // Draw filled donut
        this.drawFilledDonut(ctx, projected)
      }
    },

    project3D(point3D) {
      // Apply donut rotation
      const rotated = this.rotatePoint3D(point3D)

      // Fixed camera - always centered with perspective
      const distance = 5 // Fixed camera distance
      const fov = 400    // Field of view
      const scale = fov / (distance + rotated.z)

      // Center the donut on canvas
      return app.vec2(
        canvasEl.value.width / 2 + rotated.x * scale,
        canvasEl.value.height / 2 + rotated.y * scale
      )
    },

    rotatePoint3D(point) {
      // Apply rotation around X axis
      const cosX = Math.cos(this.rotationX)
      const sinX = Math.sin(this.rotationX)
      const y1 = point.y * cosX - point.z * sinX
      const z1 = point.y * sinX + point.z * cosX

      // Apply rotation around Y axis
      const cosY = Math.cos(this.rotationY)
      const sinY = Math.sin(this.rotationY)
      const x2 = point.x * cosY - z1 * sinY
      const z2 = point.x * sinY + z1 * cosY

      // Apply rotation around Z axis
      const cosZ = Math.cos(this.rotationZ)
      const sinZ = Math.sin(this.rotationZ)
      const x3 = x2 * cosZ - y1 * sinZ
      const y3 = x2 * sinZ + y1 * cosZ

      return { x: x3, y: y3, z: z2 }
    },

    drawWireframe(ctx, points) {
      ctx.beginPath()

      // Draw rings (circles around the donut)
      for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
          const idx = i * segments + j
          const nextIdx = i * segments + ((j + 1) % segments)

          ctx.moveTo(points[idx].x, points[idx].y)
          ctx.lineTo(points[nextIdx].x, points[nextIdx].y)
        }
      }

      // Draw segments (lines through the hole)
      for (let j = 0; j < segments; j++) {
        for (let i = 0; i < rings; i++) {
          const idx = i * segments + j
          const nextIdx = ((i + 1) % rings) * segments + j

          ctx.moveTo(points[idx].x, points[idx].y)
          ctx.lineTo(points[nextIdx].x, points[nextIdx].y)
        }
      }

      ctx.stroke()
    },

    drawFilledDonut(ctx, points) {
      // Create triangles for filled rendering with backface culling
      for (let i = 0; i < rings; i++) {
        const nextI = (i + 1) % rings
        for (let j = 0; j < segments; j++) {
          const nextJ = (j + 1) % segments

          const p1 = points[i * segments + j]
          const p2 = points[nextI * segments + j]
          const p3 = points[i * segments + nextJ]
          const p4 = points[nextI * segments + nextJ]

          // Calculate normal for backface culling (simple version)
          const centerX = (p1.x + p2.x + p3.x + p4.x) / 4
          const centerY = (p1.y + p2.y + p3.y + p4.y) / 4
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - canvasEl.value.width / 2, 2) +
            Math.pow(centerY - canvasEl.value.height / 2, 2)
          )

          // Only draw if facing somewhat towards camera (simple heuristic)
          if (distanceFromCenter < 300) {
            // Draw two triangles for each quad
            this.drawTriangle(ctx, p1, p2, p3)
            this.drawTriangle(ctx, p2, p4, p3)
          }
        }
      }
    },

    drawTriangle(ctx, p1, p2, p3) {
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p3.x, p3.y)
      ctx.closePath()

      // Calculate brightness based on triangle position
      const centerX = (p1.x + p2.x + p3.x) / 3
      const centerY = (p1.y + p2.y + p3.y) / 3

      const distanceFromCenter = Math.sqrt(
        Math.pow(centerX - canvasEl.value.width / 2, 2) +
        Math.pow(centerY - canvasEl.value.height / 2, 2)
      )

      // Brightness decreases with distance from center (simpler shading)
      const brightness = Math.max(0.4, 1 - distanceFromCenter / 400)

      ctx.fillStyle = `rgb(
        ${Math.floor(69 * brightness)},
        ${Math.floor(199 * brightness)},
        ${Math.floor(170 * brightness)}
      )`
      ctx.fill()

      // Subtle outline
      ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`
      ctx.lineWidth = 0.5
      ctx.stroke()
    },

    generatePoints() {
      const points = []
      const currentThickness = this.thickness * r

      for (let i = 0; i < rings; i++) {
        const phi = (i / rings) * Math.PI * 2  // Major circle angle
        for (let j = 0; j < segments; j++) {
          const theta = (j / segments) * Math.PI * 2  // Minor circle angle

          // Torus parametric equations
          const x = (R + currentThickness * Math.cos(theta)) * Math.cos(phi)
          const y = currentThickness * Math.sin(theta)
          const z = (R + currentThickness * Math.cos(theta)) * Math.sin(phi)

          points.push({ x, y, z })
        }
      }

      this.points = points
    }
  })

  // Generate initial points
  donut.generatePoints()

  // Add manual rotation with mouse
  setupMouseControls()
}

// Handle mouse interaction for manual rotation
const setupMouseControls = () => {
  if (!canvasEl.value) return

  let isDragging = false
  let lastX = 0
  let lastY = 0

  canvasEl.value.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    autoRotate.value = false // Disable auto-rotate when manually rotating
  })

  canvasEl.value.addEventListener('mousemove', (e) => {
    if (!isDragging || !donut) return

    const deltaX = e.clientX - lastX
    const deltaY = e.clientY - lastY

    donut.rotationY += deltaX * 0.01
    donut.rotationX += deltaY * 0.01

    lastX = e.clientX
    lastY = e.clientY
  })

  canvasEl.value.addEventListener('mouseup', () => {
    isDragging = false
  })

  canvasEl.value.addEventListener('mouseleave', () => {
    isDragging = false
  })
}

// Watch for control changes
watch([donutThickness, showWireframe], () => {
  if (donut) {
    donut.thickness = donutThickness.value
    donut.wireframe = showWireframe.value
    donut.generatePoints()
  }
})

// Lifecycle
onMounted(() => {
  initDonut()
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})
</script>

<style scoped>
.donut-demo {
  text-align: center;
  padding: 20px;
  background: #1a1a2e;
  color: white;
  border-radius: 10px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.controls input[type="range"] {
  width: 100px;
}

.controls input[type="checkbox"] {
  margin-left: 5px;
}

canvas {
  border: 2px solid #4ecdc4;
  border-radius: 8px;
  background: #16213e;
  cursor: grab;
  display: block;
  margin: 0 auto;
}

canvas:active {
  cursor: grabbing;
}

h2 {
  color: #4ecdc4;
  margin-bottom: 20px;
}
</style>
