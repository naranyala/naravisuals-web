<script setup>
import { onMounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'

const canvasRef = ref(null)
let app = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Make canvas fill its container
  const resizeCanvas = () => {
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Initialize the engine
  app = createCanvasApp(canvas)
  app.use(mathPlugin)

  // Coordinate grid (centered, with axes)
  app.math.grid({
    step: 50,
    color: '#cccccc',
    lineWidth: 1,
    labels: true,
    font: '10px monospace',
    labelColor: '#666666',
    axes: true,
    subDivisions: 5
  })

  // ——— Venn Diagram ———
  const center = app.vec2(canvas.width / 2, canvas.height / 2)
  const radius = 130
  const offset = 85

  const posA = center.add(app.vec2(-offset, -offset * 0.577))  // equilateral layout
  const posB = center.add(app.vec2(offset, -offset * 0.577))
  const posC = center.add(app.vec2(0, offset * 1.1))

  // Draw three semi-transparent circles
  const drawCircle = (pos, color) => {
    app.root.add({
      x: pos.x,
      y: pos.y,
      draw(ctx) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, app.math.TAU)
        ctx.fill()
      }
    })
  }

  drawCircle(posA, 'rgba(255, 100, 100, 0.45)')   // Red-ish
  drawCircle(posB, 'rgba(100, 150, 255, 0.45)')   // Blue-ish
  drawCircle(posC, 'rgba(255, 220, 100, 0.45)')   // Yellow-ish

    // Labels A, B, C
    ;[{ pos: posA, label: 'A' }, { pos: posB, label: 'B' }, { pos: posC, label: 'C' }].forEach(item => {
      app.root.add({
        x: item.pos.x,
        y: item.pos.y - radius - 30,
        draw(ctx) {
          ctx.font = 'bold 48px Arial, sans-serif'
          ctx.fillStyle = '#222'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.label, 0, 0)
        }
      })
    })

  // Center label
  app.root.add({
    x: center.x,
    y: center.y + 15,
    draw(ctx) {
      ctx.font = '20px Arial, sans-serif'
      ctx.fillStyle = 'white'
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 4
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.strokeText('All', 0, 0)
      ctx.fillText('All', 0, 0)
    }
  })

  // Optional: animated particle traveling along the triple intersection curve
  app.start(function* () {
    const curve = [
      ...app.math.bezier.quadraticPoints(posA, center.add(app.vec2(0, -radius * 0.7)), posB, 40),
      ...app.math.bezier.quadraticPoints(posB, center.add(app.vec2(radius * 0.8, radius * 0.4)), posC, 40),
      ...app.math.bezier.quadraticPoints(posC, center.add(app.vec2(-radius * 0.8, radius * 0.4)), posA, 40)
    ]

    let i = 0
    while (true) {
      const pt = curve[i % curve.length]
      app.root.add({
        x: pt.x,
        y: pt.y,
        draw(ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, 9, 0, app.math.TAU)
          ctx.fill()
          ctx.stroke()
        }
      })
      i += 2
      yield 40
    }
  })
})
</script>

<template>
  <div class="container">
    <canvas ref="canvasRef"></canvas>

    <div class="info-panel">
      <h2>Venn Diagram on Cartesian Grid</h2>
      <p>Three-set Venn diagram with proper X/Y axes</p>
      <small>canvas_util.js + mathPlugin</small>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f8f8f8;
  overflow: hidden;
  font-family: system-ui, sans-serif;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.info-panel h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #222;
}

.info-panel p {
  margin: 4px 0;
  color: #444;
}

.info-panel small {
  display: block;
  margin-top: 12px;
  color: #777;
  font-size: 0.8rem;
}
</style>
