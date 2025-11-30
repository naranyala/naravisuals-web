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
        <input type="range" v-model="donutThickness" min="0.3" max="1.2" step="0.1">
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
    <p class="hint">Click and drag to rotate manually</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

const canvasEl = ref(null)
let app = null
let donut = null

const rotationSpeed = ref(1.0)
const donutThickness = ref(0.8)
const showWireframe = ref(false)
const autoRotate = ref(true)

const R = 1.5
const r = 0.6
const segments = 50
const rings = 40

const initDonut = () => {
  if (!canvasEl.value) return

  app = createCanvasApp(canvasEl.value)
  app.use(mathPlugin)

  donut = app.root.add({
    rotationX: 0.5,
    rotationY: 0.5,
    rotationZ: 0,
    vertices: [],
    faces: [],
    wireframe: showWireframe.value,
    thickness: donutThickness.value,

    update(dt) {
      if (autoRotate.value) {
        this.rotationY += (dt / 1000) * rotationSpeed.value
        this.rotationX += (dt / 1000) * rotationSpeed.value * 0.7
      }
    },

    draw(ctx) {
      if (!this.vertices.length) return

      const transformed = this.transformVertices()
      const facesWithDepth = this.sortFaces(transformed)

      const lightDir = { x: 0.5, y: 0.7, z: 0.5 }
      const lightMag = Math.sqrt(lightDir.x ** 2 + lightDir.y ** 2 + lightDir.z ** 2)
      lightDir.x /= lightMag
      lightDir.y /= lightMag
      lightDir.z /= lightMag

      for (const { face } of facesWithDepth) {
        const p1 = transformed[face[0]]
        const p2 = transformed[face[1]]
        const p3 = transformed[face[2]]

        const v1x = p2.x - p1.x
        const v1y = p2.y - p1.y
        const v2x = p3.x - p1.x
        const v2y = p3.y - p1.y
        const cross = v1x * v2y - v1y * v2x

        if (cross > 0) continue

        const avgNormal = {
          x: (p1.nx + p2.nx + p3.nx) / 3,
          y: (p1.ny + p2.ny + p3.ny) / 3,
          z: (p1.nz + p2.nz + p3.nz) / 3
        }

        const dot = Math.max(0, -(
          avgNormal.x * lightDir.x +
          avgNormal.y * lightDir.y +
          avgNormal.z * lightDir.z
        ))

        const ambient = 0.3
        const diffuse = 0.7
        const brightness = ambient + diffuse * dot

        if (this.wireframe) {
          ctx.strokeStyle = '#ff6b6b'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(p3.x, p3.y)
          ctx.closePath()
          ctx.stroke()
        } else {
          this.drawTriangle(ctx, p1, p2, p3, brightness)
        }
      }
    },

    transformVertices() {
      return this.vertices.map(v => {
        const rotated = this.rotatePoint(
          { x: v.x, y: v.y, z: v.z },
          this.rotationX,
          this.rotationY,
          this.rotationZ
        )
        const rotatedNormal = this.rotatePoint(
          { x: v.nx, y: v.ny, z: v.nz },
          this.rotationX,
          this.rotationY,
          this.rotationZ
        )
        const projected = this.project3D(rotated)

        return {
          ...projected,
          nx: rotatedNormal.x,
          ny: rotatedNormal.y,
          nz: rotatedNormal.z,
          originalZ: rotated.z
        }
      })
    },

    sortFaces(transformed) {
      const facesWithDepth = this.faces.map(face => {
        const avgZ = (
          transformed[face[0]].originalZ +
          transformed[face[1]].originalZ +
          transformed[face[2]].originalZ
        ) / 3
        return { face, avgZ }
      })

      facesWithDepth.sort((a, b) => a.avgZ - b.avgZ)
      return facesWithDepth
    },

    rotateX(point, angle) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos
      }
    },

    rotateY(point, angle) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos
      }
    },

    rotateZ(point, angle) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
        z: point.z
      }
    },

    rotatePoint(point, rx, ry, rz) {
      let p = this.rotateX(point, rx)
      p = this.rotateY(p, ry)
      p = this.rotateZ(p, rz)
      return p
    },

    project3D(point3D) {
      const distance = 6
      const fov = 500
      const scale = fov / (distance + point3D.z)

      return {
        x: canvasEl.value.width / 2 + point3D.x * scale,
        y: canvasEl.value.height / 2 - point3D.y * scale,
        z: point3D.z
      }
    },

    drawTriangle(ctx, p1, p2, p3, brightness) {
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p3.x, p3.y)
      ctx.closePath()

      const color = Math.floor(brightness * 255)
      ctx.fillStyle = `rgb(${Math.floor(color * 0.3)}, ${Math.floor(color * 0.8)}, ${Math.floor(color * 0.7)})`
      ctx.fill()

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    },

    generateGeometry() {
      this.vertices = []
      this.faces = []
      const currentR = this.thickness * r

      for (let i = 0; i <= rings; i++) {
        const phi = (i / rings) * Math.PI * 2
        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2

          const x = (R + currentR * Math.cos(theta)) * Math.cos(phi)
          const y = currentR * Math.sin(theta)
          const z = (R + currentR * Math.cos(theta)) * Math.sin(phi)

          const nx = Math.cos(theta) * Math.cos(phi)
          const ny = Math.sin(theta)
          const nz = Math.cos(theta) * Math.sin(phi)

          this.vertices.push({ x, y, z, nx, ny, nz })
        }
      }

      for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
          const p1 = i * (segments + 1) + j
          const p2 = p1 + (segments + 1)
          const p3 = p1 + 1
          const p4 = p2 + 1

          this.faces.push([p1, p2, p3])
          this.faces.push([p2, p4, p3])
        }
      }
    }
  })

  donut.generateGeometry()
  setupMouseControls()
}

const setupMouseControls = () => {
  if (!canvasEl.value) return

  let isDragging = false
  let lastX = 0
  let lastY = 0

  canvasEl.value.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    autoRotate.value = false
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

watch([donutThickness, showWireframe], () => {
  if (donut) {
    donut.thickness = donutThickness.value
    donut.wireframe = showWireframe.value
    donut.generateGeometry()
  }
})

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
  background: #0f0f1e;
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

.hint {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
}
</style>
