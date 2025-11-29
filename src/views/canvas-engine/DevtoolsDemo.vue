<script setup>
import { onMounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { textPlugin } from '../../lib/engine/textPlugin.js'
import { canvasDevtoolsPlugin } from '../../lib/engine/canvasDevtoolsPlugin.js'

const canvas = ref(null)
let app = null

onMounted(() => {
  const cvs = canvas.value

  // Responsive canvas
  const resize = () => {
    cvs.width = window.innerWidth
    cvs.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Initialize engine
  app = createCanvasApp(cvs)
  app.use(textPlugin)
  app.use(canvasDevtoolsPlugin)   // ← Only this plugin + text

  // ——— Minimal demo scene ———

  // Dark background
  app.root.add({
    draw(ctx) {
      ctx.fillStyle = '#0f0f1f'
      ctx.fillRect(0, 0, cvs.width, cvs.height)
    }
  })

  // Big title
  app.text.gradient(0, -140, 'canvasDevtoolsPlugin', {
    size: 88,
    gradient: ['#ff4da6', '#7873f5', '#00e7ff'],
    font: 'bold sans-serif'
  })

  app.text.stroke(0, -60, 'Press ` (backtick) to toggle DevTools', {
    size: 28,
    color: '#a0f0ff',
    strokeColor: '#000',
    strokeWidth: 6
  })

  // Click anywhere → spawn random colored text (to test object counter)
  cvs.addEventListener('pointerdown', () => {
    const colors = ['#ff6bc8', '#66ffb3', '#ffe66d', '#8aadff', '#ff9d6b']
    const words = ['Click!', 'Boom!', 'Hello', 'Test', 'Spawn', 'Live', 'Debug']

    const obj = app.text.basic(
      app.pointer.x - cvs.width / 2,
      app.pointer.y - cvs.height / 2,
      words[Math.floor(Math.random() * words.length)],
      {
        size: 30 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI
      }
    )

    // Auto-fade out
    app.animateTo(obj, 'opacity', 0, 1500)
    setTimeout(() => app.root.remove(obj), 1600)
  })

  // Bonus: spawn a few objects every 2 seconds
  app.start(function* () {
    while (true) {
      yield 2000
      if (Math.random() > 0.6) {
        const x = (Math.random() - 0.5) * cvs.width * 1.4
        const y = (Math.random() - 0.5) * cvs.height * 1.4
        app.text.basic(x, y, 'Auto', { size: 24, color: '#aaaaaa', opacity: 0.7 })
      }
    }
  })
})
</script>

<template>
  <div class="container">
    <canvas ref="canvas" class="canvas" />
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  margin: 0;
  background: #000;
  overflow: hidden;
  font-family: system-ui, sans-serif;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
}
</style>
