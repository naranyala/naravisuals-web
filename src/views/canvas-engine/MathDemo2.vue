<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { createCanvasApp } from "../../lib/engine/canvas_util.js"
import { mathPlugin } from "../../lib/engine/mathPlugin.js"

const canvasRef = ref(null)
let app = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Resize canvas to fill parent
  const resize = () => {
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create the app
  app = createCanvasApp(canvas)
  app.use(mathPlugin)

  // ————————————————————————
  // Beautiful Math Demo Scene
  // ————————————————————————

  // Background gradient
  const bg = app.root.add({
    draw(ctx) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      grad.addColorStop(0, '#0f0c29')
      grad.addColorStop(0.3, '#302b63')
      grad.addColorStop(1, '#24243e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  })

  // Grid (subtle)
  app.math.grid({
    step: 50,
    color: '#333344',
    lineWidth: 1,
    labels: false
  })

  // ——— Plot 1: y = sin(x) + cos(3x) ———
  app.math.plot.function(
    x => Math.sin(x) * 1.5 + Math.cos(x * 3) * 0.5,
    {
      range: [-10, 10],
      scale: 40,
      color: '#ff6b6b',
      lineWidth: 4
    }
  )

  // ——— Plot 2: Spiral (polar) ———
  app.math.plot.polar(
    t => t * 10, // Archimedean spiral
    {
      thetaMax: Math.PI * 8,
      steps: 800,
      color: '#4ecdc4',
      lineWidth: 3
    }
  )

  // ——— Lissajous Figure (animated) ———
  const lissajousDot = app.shapes.circle(0, 0, 8, '#ffd93d')
  lissajousDot.shadowBlur = 20
  lissajousDot.shadowColor = '#ffd93d'

  app.start(function* () {
    let t = 0
    while (true) {
      const scale = 120
      lissajousDot.x = canvas.width / 2 + Math.sin(5 * t) * scale
      lissajousDot.y = canvas.height / 2 + Math.sin(7 * t + Math.PI / 3) * scale
      t += 0.02
      yield 16
    }
  })

  // ——— Interactive Vector Field (mouse gravity!) ———
  const mouseVec = app.vec2()
  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect()
    mouseVec.x = e.clientX - rect.left
    mouseVec.y = e.clientY - rect.top
  })

  const field = app.math.vectorField((x, y) => {
    const diff = mouseVec.sub(app.vec2(x, y))
    const dist = Math.max(diff.length(), 50)
    return diff.mul(4000 / (dist * dist))
  }, {
    cellSize: 40,
    arrowScale: 10,
    color: '#00f2ff',
    lineWidth: 2
  })

  // ——— Floating Math Title ———
  const title = app.root.add({
    x: canvas.width / 2,
    y: 80,
    text: 'Interactive Math Canvas',
    font: 'bold 48px "Fira Code", monospace',
    color: '#ffffff',
    opacity: 0,
    draw(ctx) {
      ctx.font = this.font
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.opacity
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.text, this.x, this.y)
    }
  })

  // Animate title fade-in
  app.animateTo(title, 'opacity', 1, 2000)

  // ——— Particle explosion on click ———
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2
      const speed = 2 + Math.random() * 5
      const particle = app.shapes.circle(cx, cy, 4 + Math.random() * 6, `hsl(${Math.random() * 360}, 100%, 70%)`)
      particle.vx = Math.cos(angle) * speed
      particle.vy = Math.sin(angle) * speed
      particle.life = 100

      app.start(function* () {
        while (particle.life > 0) {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.15 // gravity
          particle.opacity = particle.life / 100
          particle.life -= 2
          yield 16
        }
        app.root.remove(particle)
      })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    if (app) app.stop()
  })
})
</script>

<template>
  <div class="math-canvas-container">
    <canvas ref="canvasRef" class="math-canvas" />
    <div class="overlay">
      <h1>Vue + Canvas Math Engine</h1>
      <p>Move mouse → vector field follows<br>Click → particle explosion!</p>
    </div>
  </div>
</template>

<style scoped>
.math-canvas-container {
  width: 100vw;
  height: 100vh;
  background: #0f0c29;
  position: relative;
  overflow: hidden;
  font-family: 'Fira Code', 'Courier New', monospace;
}

.math-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  /* optional retro feel */
}

.overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  pointer-events: none;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  margin: 10px 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}
</style>
