<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { textPlugin } from '../../lib/engine/textPlugin.js'
import { gridAndRulerPlugin } from '../../lib/engine/gridAndRulerPlugin.js'

const canvas = ref(null)
let app = null

onMounted(() => {
  const cvs = canvas.value
  if (!cvs) return

  // Responsive canvas
  const resizeCanvas = () => {
    cvs.width = window.innerWidth
    cvs.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Initialize engine
  app = createCanvasApp(cvs)
  app.use(textPlugin)
  app.use(gridAndRulerPlugin)

  // ——— Demo Scene ———

  // Background
  app.root.add({
    draw(ctx) {
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(-cvs.width * 2, -cvs.height * 2, cvs.width * 5, cvs.height * 5)
    }
  })

  // Title
  app.text.gradient(0, -180, 'Grid & Ruler Plugin', {
    size: 84,
    gradient: ['#ff4da6', '#6e44ff', '#00d4ff'],
    font: 'bold sans-serif'
  })

  app.text.stroke(0, -100, 'Pure CSS • No Inline • No Tailwind', {
    size: 32,
    color: '#a8ff8c',
    strokeColor: '#000000',
    strokeWidth: 6
  })

  app.text.multiline(0, 320,
    'Click → spawn snapped text\n' +
    'Scroll → zoom grid (10–200px)\n' +
    'G → toggle grid & rulers\n' +
    '0 → reset to 50px',
    { size: 24, color: '#cccccc', maxWidth: 680, align: 'center' }
  )

  // Click spawn
  cvs.addEventListener('pointerdown', () => {
    const gridSize = app.grid.config.gridSize
    const x = Math.round((app.pointer.x - cvs.width / 2) / gridSize) * gridSize
    const y = Math.round((app.pointer.y - cvs.height / 2) / gridSize) * gridSize

    const obj = app.text.basic(x, y, 'SNAP!', {
      size: 72,
      color: '#ffff66',
      rotation: Math.random() * 0.4 - 0.2
    })

    app.animateTo(obj, 'scaleX', 3, 500)
    app.animateTo(obj, 'scaleY', 3, 500)
    app.animateTo(obj, 'opacity', 0, 700)
    setTimeout(() => app.root.remove(obj), 800)
  })

  // Zoom with scroll
  cvs.addEventListener('wheel', e => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.25 : 0.8
    let size = app.grid.config.gridSize * factor
    size = Math.max(10, Math.min(200, Math.round(size / 5) * 5))
    app.grid.setSize(size)
  }, { passive: false })

  // Keyboard controls
  window.addEventListener('keydown', e => {
    if (e.key === 'g' || e.key === 'G') app.grid.toggle()
    if (e.key === '0') app.grid.setSize(50)
  })

  // Live status bar at top
  app.text.basic(0, -cvs.height / 2 + 60, '', {
    size: 18,
    color: '#ffff00',
    font: 'monospace',
    align: 'center',
    baseline: 'top'
  }).draw = function (ctx) {
    const msg = `Grid: ${app.grid.config.gridSize}px  •  Major every: ${app.grid.config.majorGridSize}px  •  Press G to toggle`
    const padding = 14
    const height = 36
    const metrics = ctx.measureText(msg)

    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.roundRect(-metrics.width / 2 - padding, -padding, metrics.width + padding * 2, height, 14)
    ctx.fill()

    ctx.fillStyle = '#ffff00'
    ctx.font = '18px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(msg, 0, 6)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
    if (app) app.stop()
  })
})
</script>

<template>
  <div class="container">
    <canvas ref="canvas" class="canvas" />

    <div class="overlay">
      <h1>Grid & Ruler Demo</h1>
      <ul>
        <li>Click anywhere → spawn snapped text</li>
        <li>Scroll → zoom grid</li>
        <li><kbd>G</kbd> → toggle grid & rulers</li>
        <li><kbd>0</kbd> → reset grid size</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 0;
  background: #000;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  color: white;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  background: #0a0a1a;
}

.overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  max-width: 320px;
  pointer-events: none;
  z-index: 10;
}

.overlay h1 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #ff4da6, #6e44ff, #00d4ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

.overlay ul {
  margin: 0;
  padding-left: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #cccccc;
}

.overlay kbd {
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: inherit;
  font-weight: bold;
}
</style>
