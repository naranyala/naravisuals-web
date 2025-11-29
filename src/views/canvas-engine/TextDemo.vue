<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { textPlugin } from '../../lib/engine/textPlugin.js'

// Reactive canvas ref
const canvasRef = ref(null)
let app = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Resize canvas to fill parent
  canvas.width = 1200
  canvas.height = 600

  // Create the app
  app = createCanvasApp(canvas)
  app.use(shapePlugin)
  app.use(textPlugin)

  // ———— DEMO SCENE ————

  // Background
  app.shapes.rect(0, 0, 2000, 2000, '#0a0a1f')

  // Title with gradient
  app.text.gradient(
    app.canvas.width / 2,
    120,
    'Click me please',
    {
      size: 80,
      gradient: ['#ff4d9e', '#6e00ff', '#00d0ff'],
      font: 'bold sans-serif'
    }
  )

  // Stroked subtitle
  app.text.stroke(
    app.canvas.width / 2,
    220,
    'Powered by textPlugin.js',
    {
      size: 36,
      color: '#ffffff',
      strokeColor: '#ff00aa',
      strokeWidth: 6
    }
  )

  // Typewriter effect
  app.text.typewriter(
    100,
    320,
    'Watch me type live in Vue 3 with full transform & animation support...',
    {
      size: 28,
      color: '#a0ff80',
      speed: 60,
      cursor: '▊',
      cursorBlink: 400
    }
  )

  // Interactive bouncing balls with text labels
  const balls = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 180
    const ballX = app.canvas.width / 2 + Math.cos(angle) * radius
    const ballY = 500 + Math.sin(angle) * radius

    const ball = app.shapes.circle(ballX, ballY, 40, '#ff3366')
    const label = app.text.basic(ballX, ballY, `Ball ${i + 1}`, {
      size: 18,
      color: '#ffffff',
      font: 'bold sans-serif'
    })

    // Make them bounce
    let vy = (Math.random() - 0.5) * 3
    ball.update = () => {
      ball.y += vy
      vy += 0.3 // gravity
      if (ball.y > app.canvas.height - 100) {
        ball.y = app.canvas.height - 100
        vy *= -0.8
      }
      label.x = ball.x
      label.y = ball.y
    }

    balls.push({ ball, label })
  }

  // Multiline centered text block
  app.text.multiline(
    app.canvas.width / 2,
    app.canvas.height - 120,
    'This entire scene runs at 60 FPS with full support for:\n• Transformations (x, y, rotation, scale)\n• Opacity & layering\n• Coroutines & animations\n• Pointer events\n• And your brand-new textPlugin!',
    {
      size: 22,
      color: '#cccccc',
      lineHeight: 1.5,
      maxWidth: 700,
      align: 'center'
    }
  )

  // Mouse follower text
  const follower = app.text.basic(0, 0, '★', { size: 48, color: '#ffff00' })
  app.start(function* () {
    while (true) {
      follower.x = app.pointer.x
      follower.y = app.pointer.y
      follower.rotation += 0.05
      yield
    }
  })

  // Click to spawn explosion text
  canvas.addEventListener('pointerdown', (e) => {
    const x = app.pointer.x
    const y = app.pointer.y

    const boom = app.text.basic(x, y, 'BOOM!', {
      size: 60,
      color: '#ff3366'
    })

    // Animate explosion
    app.animateTo(boom, 'scaleX', 3, 600)
    app.animateTo(boom, 'scaleY', 3, 600)
    app.animateTo(boom, 'opacity', 0, 800)

    setTimeout(() => app.root.remove(boom), 900)
  })

  // Responsive resize
  const resize = () => {
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
  }
  window.addEventListener('resize', resize)
  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    if (app) app.stop()
  })
})
</script>

<template>
  <div class="w-screen h-screen bg-black overflow-hidden">
    <canvas ref="canvasRef" class="block w-full h-full" style="image-rendering: pixelated;" />
  </div>
</template>

<style scoped>
/* Optional: crisp pixels if you like retro look */
canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
