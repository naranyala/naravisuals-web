<template>
  <div class="app">
    <h1>Canvas + Tween Demo in Vue 3</h1>
    <canvas ref="canvas" width="900" height="400"></canvas>

    <div class="controls">
      <button @click="startDemo">Run Full Demo</button>
      <button @click="shakeAll">Shake Everything!</button>
      <button @click="pulseBalls">Pulse Balls</button>
      <button @click="flashTitle">Flash Title</button>
    </div>
  </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue'
// import { createCanvasApp } from './canvas_util.js'
// import { tweenPlugin } from './tweenPlugin.js'

import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { tweenPlugin } from '../../lib/engine/tweenPlugin.js'


const canvas = ref(null)
let app = null
let balls = []
let title = null

onMounted(() => {
  app = createCanvasApp(canvas.value)
  app.use(tweenPlugin) // ← activates app.tween.*

  // Background layer
  const bgLayer = app.createLayer(-10)
  bgLayer.add({
    draw(ctx) {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, app.canvas.width, app.canvas.height)

      // Stars
      ctx.fillStyle = '#fff'
      for (let i = 0; i < 100; i++) {
        const x = (i * 137.5) % app.canvas.width
        const y = (i * 91.7) % app.canvas.height
        ctx.fillRect(x, y, 1.5, 1.5)
      }
    }
  })

  // Title text object
  title = app.root.add({
    x: app.canvas.width / 2,
    y: 100,
    text: 'Vue + Canvas + Tween = ❤️',
    font: 'bold 28px Arial',
    color: '#60a5fa',
    opacity: 1,
    draw(ctx) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = this.font
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.opacity
      ctx.fillText(this.text, 0, 0)
    }
  })

  // Create colorful bouncing balls
  const colors = ['#f87171', '#fbbf24', '#a3e635', '#34d399', '#60a5fa', '#c084fc']
  for (let i = 0; i < 6; i++) {
    const ball = app.root.add({
      x: 100 + i * 100,
      y: 300,
      radius: 20,
      color: colors[i],
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      draw(ctx) {
        ctx.fillStyle = this.color
        ctx.shadowBlur = 20
        ctx.shadowColor = this.color
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    balls.push(ball)
  }

  // Click anywhere → spawn explosion of particles
  app.canvas.addEventListener('pointerdown', (e) => {
    const rect = app.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    createParticleExplosion(x, y)
  })
})

async function startDemo() {
  // Animate title entrance
  title.opacity = 0
  title.scaleX = title.scaleY = 0.3
  await app.tween.to(title, 'opacity', 1, 1200, 'easeOutCubic')
  await app.tween.toMultiple(title, { scaleX: 1, scaleY: 1 }, 800, 'easeOutBack')

  // Balls fall in one by one
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i]
    ball.y = -100
    ball.x = 150 + i * 100

    await app.tween.to(ball, 'y', 300, 800, 'easeOutBounce')
    await app.tween.shake(ball, 15, 400)
  }

  // Path animation: move first ball in a heart shape
  const heartPath = generateHeartPath(400, 300, 150)
  await app.tween.path(balls[0], heartPath, 3000, 'easeInOutSine')

  // Spring back to position
  await app.tween.spring(balls[0], 'x', 100, 170, 12)
  await app.tween.spring(balls[0], 'y', 300, 170, 12)
}

function shakeAll() {
  balls.forEach(ball => app.tween.shake(ball, 30, 600))
  app.tween.shake(title, 20, 600)
}

function pulseBalls() {
  balls.forEach(ball => app.tween.pulse(ball, 'scaleX', 0.4, 600))
  balls.forEach(ball => app.tween.pulse(ball, 'scaleY', 0.4, 600))
}

function flashTitle() {
  app.tween.flash(title, 5, 150)
}

// Bonus: particle explosion on click
function createParticleExplosion(x, y) {
  const particleLayer = app.createLayer(100)
  const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a29bfe']

  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.3
    const speed = 3 + Math.random() * 6
    const life = 800 + Math.random() * 600

    const p = particleLayer.add({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      life,
      age: 0,
      update(dt) {
        this.age += dt
        this.x += this.vx * (dt / 16)
        this.y += this.vy * (dt / 16)
        this.vy += 0.2 // gravity
        this.opacity = 1 - this.age / this.life
        if (this.age > this.life) particleLayer.remove(this)
      },
      draw(ctx) {
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  // Auto-remove layer when empty
  app.start(function* () {
    while (particleLayer.objects.length > 0) yield 100
    app.layers.splice(app.layers.indexOf(particleLayer), 1)
  })
}

// Helper: generate heart-shaped path points
function generateHeartPath(cx, cy, size) {
  const points = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60 * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    points.push({
      x: cx + x * size / 20,
      y: cy - y * size / 20
    })
  }
  return points
}
</script>

<style scoped>
.app {
  font-family: system-ui, sans-serif;
  background: #020617;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

h1 {
  margin-bottom: 1rem;
  font-size: 2.5rem;
  background: linear-gradient(90deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

canvas {
  border: 2px solid #1e293b;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
}

.controls button {
  margin: 0 0.5rem;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  background: #1e293b;
  color: white;
  border: 2px solid #475569;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  background: #475569;
  transform: translateY(-2px);
}
</style>
