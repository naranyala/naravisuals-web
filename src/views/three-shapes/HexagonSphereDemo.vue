<script setup>

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

const canvasRef = ref(null)
let app = null
let sphereObj = null

// Simple controls
const frequency = ref(2)
const rotationSpeed = ref(1)

function createSimpleSphere() {
  const { vec2, root, math } = app

  // Clear previous sphere
  if (sphereObj) root.remove(sphereObj)

  // Create vertices for a simple sphere using icosahedron
  const PHI = (1 + Math.sqrt(5)) / 2
  const radius = 200

  const vertices = [
    vec2(-1, PHI, 0), vec2(1, PHI, 0), vec2(-1, -PHI, 0), vec2(1, -PHI, 0),
    vec2(0, -1, PHI), vec2(0, 1, PHI), vec2(0, -1, -PHI), vec2(0, 1, -PHI),
    vec2(PHI, 0, -1), vec2(PHI, 0, 1), vec2(-PHI, 0, -1), vec2(-PHI, 0, 1)
  ].map(v => v.normalized().mul(radius))

  // Simple renderable object
  sphereObj = root.add({
    rotationY: 0,
    rotationX: 0,

    update(dt) {
      this.rotationY += rotationSpeed.value * dt / 1000
      this.rotationX += rotationSpeed.value * 0.3 * dt / 1000
    },

    draw(ctx) {
      const { width, height } = app.canvas
      ctx.save()
      ctx.translate(width / 2, height / 2)

      // Project 3D to 2D
      const project = (v) => {
        const cosX = Math.cos(this.rotationX), sinX = Math.sin(this.rotationX)
        const cosY = Math.cos(this.rotationY), sinY = Math.sin(this.rotationY)

        // Rotate X
        const y1 = v.y * cosX - v.z * sinX
        const z1 = v.y * sinX + v.z * cosX

        // Rotate Y
        const x2 = v.x * cosY + z1 * sinY
        const z2 = -v.x * sinY + z1 * cosY

        // Perspective
        const fov = 500
        const scale = fov / (fov + z2 + 300)
        return vec2(x2 * scale, y1 * scale)
      }

      // Draw vertices as hexagons
      vertices.forEach(v => {
        const projected = project(v)
        const size = 15

        // Draw hexagon
        ctx.save()
        ctx.translate(projected.x, projected.y)

        ctx.fillStyle = `hsla(${v.angle() * 180 / Math.PI + 180}, 80%, 60%, 0.8)`
        ctx.beginPath()

        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3
          const x = Math.cos(angle) * size
          const y = Math.sin(angle) * size

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      // Draw connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 0.5

      // Simple icosahedron edges
      const edges = [
        [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
        [1, 5], [1, 9], [1, 7], [1, 8],
        [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
        [3, 4], [3, 6], [3, 8], [3, 9],
        [4, 5], [4, 9], [4, 11],
        [5, 9], [5, 11],
        [6, 7], [6, 8], [6, 10],
        [7, 8], [7, 10],
        [8, 9],
        [10, 11]
      ]

      edges.forEach(([i, j]) => {
        const p1 = project(vertices[i])
        const p2 = project(vertices[j])

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })

      ctx.restore()
    }
  })
}

// Initialize
onMounted(() => {
  app = createCanvasApp(canvasRef.value)
  mathPlugin(app)
  createSimpleSphere()
})

// Cleanup
onUnmounted(() => {
  if (app) app.stop()
})
</script>

<template>
  <div style="position: relative; width: 100vw; height: 100vh;">
    <canvas ref="canvasRef" style="display: block; background: #000;" />

    <div style="position: absolute; top: 20px; left: 20px; color: white;">
      <h3>Minimal Hex Sphere</h3>
      <div>
        <label>
          Rotation Speed: {{ rotationSpeed.toFixed(1) }}
          <input type="range" v-model="rotationSpeed" min="0" max="3" step="0.1" />
        </label>
      </div>
      <div>
        <button @click="createSimpleSphere">Regenerate</button>
      </div>
    </div>
  </div>
</template>

<style>
input[type="range"] {
  margin-left: 10px;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
