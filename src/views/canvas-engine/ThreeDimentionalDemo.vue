<!-- ThreeDDemo.vue -->
<script setup>
import { onMounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { threeDimensionalPlugin } from '../../lib/engine/threeDimensionalPlugin.js'

const fps = ref(0)
let lastTime = performance.now()
let frameCount = 0

onMounted(() => {
  const canvas = document.getElementById('game-canvas')
  const app = createCanvasApp(canvas)
  app.use(threeDimensionalPlugin)

  const { camera, createCube, scene } = app.threeD

  const texture = new Image()
  texture.crossOrigin = 'anonymous'
  texture.src = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=512&h=512&fit=crop'

  texture.onload = () => {
    // ─── Scene ─────────────────────────────────────
    const cube1 = createCube(1.3, '#ff5555', texture)
    cube1.position.x = -2.2
    scene.add(cube1)

    const cube2 = createCube(1.3, '#55aaee')
    cube2.position.x = 2.2
    cube2.position.y = 0.8
    scene.add(cube2)

    const ground = createCube(15, '#0a0a0a')
    ground.position.y = -5
    ground.scale = { x: 1, y: 0.1, z: 1 }
    scene.add(ground)

    // ─── Main Loop ─────────────────────────────────
    app.start(function* () {
      // Camera fly-in
      yield 400
      app.animateTo(camera.position, 'z', -7, 1800, app.ease.easeOutBack)

      while (true) {
        cube1.rotation.x += 0.009
        cube1.rotation.y += 0.018

        cube2.rotation.y -= 0.014
        cube2.position.y = 0.8 + Math.sin(performance.now() * 0.0018) * 0.9

        // FPS
        frameCount++
        const now = performance.now()
        if (now - lastTime >= 1000) {
          fps.value = Math.round((frameCount * 1000) / (now - lastTime))
          frameCount = 0
          lastTime = now
        }

        yield 16
      }
    })

    // ─── Controls ──────────────────────────────────
    let dragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (e) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
    }

    const onPointerMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY

      camera.rotationY += dx * 0.006
      camera.position.z = Math.clamp(camera.position.z + dy * 0.05, -20, -2)
    }

    const onPointerUp = () => (dragging = false)

    const onWheel = (e) => {
      e.preventDefault()
      camera.position.z += e.deltaY * 0.008
      camera.position.z = Math.clamp(camera.position.z, -20, -2)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
  }
})
</script>

<template>
  <div class="container">
    <canvas id="game-canvas" class="canvas" width="1280" height="720"></canvas>

    <div class="hud">
      <div class="title">canvas_util.js 3D</div>
      <div class="subtitle">Pure software rasterizer • No WebGL</div>
      <div class="fps">FPS: {{ fps }}</div>
    </div>

    <div class="hint">Drag to orbit • Scroll to zoom</div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #000;
  overflow: hidden;
  position: relative;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  image-rendering: crisp-edges;
  /* or pixelated for retro look */
}

.canvas:active {
  cursor: grabbing;
}

.hud {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  min-width: 260px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 12px;
}

.fps {
  font-size: 20px;
  color: #0f0;
  font-weight: bold;
}

.hint {
  position: absolute;
  bottom: 24px;
  left: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-family: monospace;
}
</style>
