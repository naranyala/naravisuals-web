<template>
  <div class="cube-container">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    <div class="controls">
      <button @click="toggleRotation">{{ rotationPaused ? 'Start' : 'Pause' }} Rotation</button>
      <button @click="changeMaterial">Change Material</button>
      <button @click="toggleWireframe">{{ wireframe ? 'Solid' : 'Wireframe' }}</button>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { linearAlgebraPlugin } from '../../lib/engine/linearAlgebraPlugin.js'
import { lightAndShadowPlugin } from '../../lib/engine/lightAndShadowPlugin.js'

// Canvas setup
const canvasRef = ref(null)
const width = 800
const height = 600

// App state
const rotationPaused = ref(false)
const wireframe = ref(false)
const currentMaterial = ref(0)

// Material presets
const materialPresets = [
  { color: [1, 0.5, 0.3], shininess: 32, reflectivity: 0.2 }, // Orange plastic
  { color: [0.2, 0.6, 1.0], shininess: 128, reflectivity: 0.4 }, // Blue metallic
  { color: [0.8, 0.1, 0.1], shininess: 16, reflectivity: 0.1 }, // Red rubber
  { color: [0.3, 0.8, 0.3], shininess: 64, reflectivity: 0.3 }, // Green glossy
]

let app = null
let cube = null

function createCube() {
  const { Vector3, Matrix4 } = app.linalg

  // Cube vertices (8 corners)
  const vertices = [
    new Vector3(-1, -1, -1), new Vector3(1, -1, -1),
    new Vector3(1, 1, -1), new Vector3(-1, 1, -1),
    new Vector3(-1, -1, 1), new Vector3(1, -1, 1),
    new Vector3(1, 1, 1), new Vector3(-1, 1, 1)
  ]

  // Cube faces (6 faces with 4 vertices each)
  const faces = [
    [0, 1, 2, 3], // front
    [1, 5, 6, 2], // right
    [5, 4, 7, 6], // back
    [4, 0, 3, 7], // left
    [3, 2, 6, 7], // top
    [4, 5, 1, 0]  // bottom
  ]

  // Face normals
  const normals = [
    new Vector3(0, 0, -1),  // front
    new Vector3(1, 0, 0),   // right
    new Vector3(0, 0, 1),   // back
    new Vector3(-1, 0, 0),  // left
    new Vector3(0, 1, 0),   // top
    new Vector3(0, -1, 0)   // bottom
  ]

  return {
    x: width / 2,
    y: height / 2,
    scaleX: 80,
    scaleY: 80,
    scaleZ: 80,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,

    vertices,
    faces,
    normals,

    update(dt) {
      if (!rotationPaused.value) {
        this.rotationY += dt * 0.001
        this.rotationX += dt * 0.0007
      }
    },

    draw(ctx) {
      const { Vector3, Matrix4 } = app.linalg

      // Create transformation matrix
      const modelMatrix = new Matrix4()
        .translate(this.x, this.y, 0)
        .rotateY(this.rotationY)
        .rotateX(this.rotationX)
        .scale(this.scaleX, this.scaleY, this.scaleZ)

      // Transform vertices and calculate face depths for sorting
      const transformedVerts = this.vertices.map(v => modelMatrix.transformVector3(v))
      const faceDepths = this.faces.map(face => {
        // Average Z for depth sorting
        return face.reduce((sum, idx) => sum + transformedVerts[idx].z, 0) / face.length
      })

      // Sort faces back to front
      const sortedFaces = this.faces.map((face, i) => ({ face, normal: this.normals[i], depth: faceDepths[i] }))
        .sort((a, b) => b.depth - a.depth)

      // Draw each face
      for (const { face, normal } of sortedFaces) {
        // Transform normal to world space
        const worldNormal = normal.clone()
        const transformedPoints = face.map(idx => transformedVerts[idx])

        // Calculate face center for lighting
        const faceCenter = transformedPoints.reduce((sum, v) => sum.add(v), new Vector3())
          .mul(1 / transformedPoints.length)

        // Get material
        const material = app.materials.create(materialPresets[currentMaterial.value])

        // Calculate shading
        const color = app.shade(ctx, faceCenter, worldNormal, material)

        // Convert to CSS color
        const cssColor = `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`

        // Draw face
        ctx.fillStyle = cssColor
        ctx.strokeStyle = '#000'
        ctx.lineWidth = wireframe.value ? 2 : 1

        ctx.beginPath()
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y)
        for (let i = 1; i < transformedPoints.length; i++) {
          ctx.lineTo(transformedPoints[i].x, transformedPoints[i].y)
        }
        ctx.closePath()

        if (!wireframe.value) {
          ctx.fill()
        }
        ctx.stroke()
      }
    },

    getWorldPos() {
      return new Vector3(this.x, this.y, 0)
    }
  }
}

function toggleRotation() {
  rotationPaused.value = !rotationPaused.value
}

function changeMaterial() {
  currentMaterial.value = (currentMaterial.value + 1) % materialPresets.length
}

function toggleWireframe() {
  wireframe.value = !wireframe.value
}

onMounted(() => {
  if (!canvasRef.value) return

  // Initialize canvas app
  app = createCanvasApp(canvasRef.value)

  // Add plugins
  app.use(linearAlgebraPlugin)
  app.use(lightAndShadowPlugin)

  // Add some point lights for better 3D effect
  app.lights.addPoint(new app.linalg.Vector3(200, 150, 300), [1, 0.9, 0.7], 1.5, 500)
  app.lights.addPoint(new app.linalg.Vector3(600, 450, 200), [0.7, 0.8, 1.0], 1.2, 400)

  // Create and add cube
  cube = createCube()
  app.root.add(cube)

  // Auto-cast shadows
  app.start(function* shadowCaster() {
    while (true) {
      // Clear previous shadows
      for (let i = app.root.objects.length - 1; i >= 0; i--) {
        if (app.root.objects[i].isShadow) {
          app.root.objects.splice(i, 1)
        }
      }

      // Cast new shadows
      for (const light of app.lights.point) {
        const shadowObj = {
          ...cube,
          isShadow: true,
          draw(ctx) {
            // Simplified shadow drawing
            ctx.fillStyle = '#000'
            ctx.globalAlpha = 0.3
            cube.draw.call(this, ctx)
            ctx.globalAlpha = 1
          }
        }
        app.castShadow(shadowObj, light, -100, 0.4)
      }

      yield 100 // Update shadows every 100ms
    }
  })
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})
</script>

<style scoped>
.cube-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

canvas {
  border: 1px solid #ccc;
  border-radius: 8px;
  background: linear-gradient(45deg, #1a1a2e, #16213e);
}

.controls {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

button:hover {
  background: #4338ca;
}
</style>
