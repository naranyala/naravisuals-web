<!-- Fancy2DDemo.vue -->
<script setup>
import { onMounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { keyboardEventsPlugin } from '../../lib/engine/keyboardEventsPlugin.js'

const score = ref(0)
const scoreText = ref("")

onMounted(() => {
  const canvas = document.getElementById('canvas')
  const app = createCanvasApp(canvas)

  app.use(shapePlugin)
  app.use(keyboardEventsPlugin)

  const { shapes, keyboard, pointer, animateTo, start } = app

  // ─── Background stars ───────────────────────────────
  const stars = []
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
    })
  }

  // ─── Player (a glowing triangle ship) ─────────────────
  const player = shapes.polygon(400, 500, [
    [0, -25],
    [-15, 15],
    [15, 15]
  ], '#00ffff')
  player.speed = 5
  player.rotation = 0

  // ─── Particles system (for thrust & explosions) ───────
  const particles = []
  const createParticles = (x, y, color = '#ff6600', count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 2
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      })
    }
  }

  // ─── Enemies (falling shapes) ────────────────────────
  const enemies = []
  const spawnEnemy = () => {
    const types = ['circle', 'rect', 'polygon']
    const type = types[Math.floor(Math.random() * types.length)]
    const size = Math.random() * 30 + 20

    let enemy
    if (type === 'circle') {
      enemy = shapes.circle(Math.random() * canvas.width, -50, size, '#ff3366')
    } else if (type === 'rect') {
      enemy = shapes.rect(Math.random() * canvas.width, -50, size * 1.5, size * 1.5, '#ff3366')
    } else {
      const sides = Math.floor(Math.random() * 3) + 5
      const points = []
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2
        points.push([Math.cos(a) * size, Math.sin(a) * size])
      }
      enemy = shapes.polygon(Math.random() * canvas.width, -50, points, '#ff3366')
    }
    enemy.vy = Math.random() * 3 + 2
    enemies.push(enemy)
  }

  // Spawn enemies every 1.2 seconds
  let lastSpawn = 0

  // ─── Main game loop ──────────────────────────────────
  start(function* () {
    while (true) {
      const dt = yield

      // Background stars parallax
      stars.forEach(s => {
        s.y += s.speed
        if (s.y > canvas.height) s.y = 0
      })

      // Player movement
      if (keyboard.isDown('KeyA') || keyboard.isDown('ArrowLeft')) player.x -= player.speed
      if (keyboard.isDown('KeyD') || keyboard.isDown('ArrowRight')) player.x += player.speed
      if (keyboard.isDown('KeyW') || keyboard.isDown('ArrowUp')) player.y -= player.speed
      if (keyboard.isDown('KeyS') || keyboard.isDown('ArrowDown')) player.y += player.speed

      player.x = Math.max(30, Math.min(canvas.width - 30, player.x))
      player.y = Math.max(50, Math.min(canvas.height - 30, player.y))

      // Thrust particles when moving
      if (keyboard.isDownAlias('up') || keyboard.isDownAlias('down') ||
        keyboard.isDownAlias('left') || keyboard.isDownAlias('right')) {
        createParticles(player.x, player.y + 20, '#00ffff', 3)
      }

      // Spawn enemies
      if (performance.now() - lastSpawn > 1200) {
        spawnEnemy()
        lastSpawn = performance.now()
      }

      // Update enemies
      enemies.forEach((e, i) => {
        e.y += e.vy
        if (e.y > canvas.height + 100) {
          app.root.remove(e)
          enemies.splice(i, 1)
        }

        // Collision with player ↔ enemy
        if (Math.hypot(e.x - player.x, e.y - player.y) < 50) {
          createParticles(e.x, e.y, '#ff3366', 40)
          app.root.remove(e)
          enemies.splice(i, 1)
          score.value += 10

          // Screen shake
          animateTo(canvas.style, 'filter', 'hue-rotate(30deg)', 100)
          setTimeout(() => canvas.style.filter = '', 100)
        }
      })

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        p.size *= 0.96

        if (p.life <= 0) particles.splice(i, 1)
      }
    }
  })

  // ─── Draw everything ─────────────────────────────────
  const bgLayer = app.createLayer(-10)
  const gameLayer = app.createLayer(0)
  const fxLayer = app.createLayer(10)

  // Draw stars
  bgLayer.add({
    draw(ctx) {
      ctx.fillStyle = '#ffffff22'
      stars.forEach(s => {
        ctx.fillRect(s.x, s.y, s.size, s.size)
      })
    }
  })

  // Draw particles
  fxLayer.add({
    draw(ctx) {
      particles.forEach(p => {
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
        ctx.globalAlpha = 1
      })
    }
  })

  // Score text
  scoreText.value = ""
  // scoreText.value = shapes.text(70, 50, () => `SCORE: ${score.value}`, 32, '#00ff00')
  // scoreText.value.x = 100
  // scoreText.value.y = 60
})
</script>

<template>
  <div class="container">
    <canvas id="canvas" class="canvas" width="1000" height="700"></canvas>
    <div class="title">canvas_util.js — Pure 2D Arcade Demo</div>
    <div class="instructions">
      ←→ or WASD to move • Destroy the red shapes!
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #001122 0%, #000000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  font-family: 20px 'Courier New', monospace;
  color: white;
}

.canvas {
  border: 4px solid #0ff;
  box-shadow: 0 0 40px #0ff8;
  image-rendering: crisp-edges;
}

.title {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 0 20px cyan;
  pointer-events: none;
}

.instructions {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 255, 255, 0.1);
  padding: 12px 30px;
  border-radius: 30px;
  backdrop-filter: blur(4px);
  border: 1px solid #0ff4;
  pointer-events: none;
}
</style>
