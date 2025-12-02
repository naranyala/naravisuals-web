<template>
  <div class="container">
    <canvas ref="canvas" width="800" height="600"></canvas>
    <div class="info">
      <p>Drag the hexagon • Click to explode • Watch the wave effect</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

// Import your engine and plugin
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'
import { meshTopologyPlugin } from '../../lib/engine/meshTopologyPlugin.js'

const canvas = ref(null)
let app, hexMesh, emitter

onMounted(() => {
  if (!canvas.value) return

  // Initialize the canvas app
  app = createCanvasApp(canvas.value)

  // Load the mesh plugin (requires math plugin? We'll patch vec2 quickly)
  // Quick fix: add vec2 alias if not present (some versions use Vector2)
  app.vec2 = app.Vector2
  app.math = { TAU: Math.PI * 2, ease: app.easings }

  app.use(mathPlugin)
  // Apply the mesh plugin
  meshTopologyPlugin(app)

  // Create a background layer
  const bgLayer = app.createLayer(-10)
  const uiLayer = app.createLayer(10)

  // Background gradient effect
  bgLayer.add({
    draw(ctx) {
      const grad = ctx.createRadialGradient(400, 300, 0, 400, 300, 500)
      grad.addColorStop(0, '#1a0033')
      grad.addColorStop(1, '#000011')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 800, 600)
    }
  })

  // Create a colorful hexagon mesh
  hexMesh = app.mesh.regular(6, 120, { color: '#ff0066' })
  hexMesh.x = 400
  hexMesh.y = 300
  hexMesh.wireframe = true
  hexMesh.wireframeColor = '#ffffff'
  hexMesh.wireframeWidth = 2

  // Color each face differently
  hexMesh.faces.forEach((face, i) => {
    const colors = ['#ff0066', '#ff6600', '#ffd500', '#00ff99', '#0099ff', '#cc00ff']
    face.color = colors[i % colors.length]
    face.opacity = 0.9
  })

  // Add to root layer (middle)
  app.root.add(hexMesh)

  // Particle emitter for explosion
  emitter = app.createParticleEmitter({
    rate: 0,
    lifetime: 1500,
    speed: 300,
    spread: Math.PI * 2,
    size: 6,
    color: '#ff0066',
    gravity: 400,
    fade: true,
    maxParticles: 300
  })
  app.root.add(emitter)

  // Mouse interaction: drag the mesh
  let isDragging = false
  let dragOffsetX = 0, dragOffsetY = 0

  app.canvas.addEventListener('pointerdown', (e) => {
    const world = app.pointer
    if (hexMesh.containsPoint(world.x, world.y)) {
      isDragging = true
      dragOffsetX = world.x - hexMesh.x
      dragOffsetY = world.y - hexMesh.y

      // Double click → explosion!
      if (e.detail === 2) {
        explodeMesh()
      }
    }
  })

  app.canvas.addEventListener('pointermove', () => {
    if (isDragging) {
      hexMesh.x = app.pointer.x - dragOffsetX
      hexMesh.y = app.pointer.y - dragOffsetY
    }
  })

  app.canvas.addEventListener('pointerup', () => {
    isDragging = false
  })

  // Explosion effect
  function explodeMesh() {
    // Emit colorful particles
    const colors = ['#ff0066', '#ff6600', '#ffd500', '#00ff99', '#0099ff', '#cc00ff']
    for (let i = 0; i < 180; i++) {
      emitter.x = hexMesh.x
      emitter.y = hexMesh.y
      emitter.color = colors[i % colors.length]
      emitter.emit(1)
    }

    // Deform mesh with explosion
    app.mesh.effects.explode(hexMesh, 300, 800)

    // Reset after explosion
    setTimeout(() => {
      hexMesh.center()
      hexMesh.x = 400
      hexMesh.y = 300
      hexMesh.scaleX = hexMesh.scaleY = 1
    }, 1000)
  }

  // Continuous wave deformation
  app.mesh.effects.wave(hexMesh, 20, 6, 1.5)

  // Add a floating title
  uiLayer.add(app.createText(400, 60, 'Deformable Mesh Demo', {
    font: 'bold 36px Arial',
    color: '#ffffff',
    align: 'center'
  }))

  uiLayer.add(app.createText(400, 100, 'Vue 3 + canvas_util.js + meshTopologyPlugin', {
    font: '18px Arial',
    color: '#aaaaaa',
    align: 'center'
  }))

  console.log('Interactive mesh demo loaded!')
})
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: system-ui, sans-serif;
}

canvas {
  border: 2px solid #333;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.info {
  margin-top: 20px;
  color: #aaa;
  font-size: 14px;
}
</style>
