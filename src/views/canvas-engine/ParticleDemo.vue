<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { particlePlugin } from '../../lib/engine/particlePlugin.js'

const canvasRef = ref(null)
let app = null
let emitter = null
let mouseTrail = false

onMounted(() => {
  // Initialize canvas
  const canvas = canvasRef.value
  canvas.width = 500
  canvas.height = 300

  // Create canvas app with plugins
  app = createCanvasApp(canvas)
  app.use(shapesPlugin)
  app.use(particlePlugin)

  // Set background
  app.ctx.fillStyle = '#0a0a1a'
  app.ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Create title
  app.shapes.text(450, 40, 'Particle System Demo', 32, '#16f4d0')
  app.shapes.text(450, 75, 'Click anywhere to create effects!', 18, '#a0a0c0')

  // Add click interaction
  canvas.addEventListener('click', handleCanvasClick)
  canvas.addEventListener('mousemove', handleMouseMove)

  // Add background animation
  app.start(function* () {
    while (true) {
      // Random sparkles
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      app.particles.sparkle(x, y, '#ffffff')
      yield 200
    }
  }, 'sparkles')
})

onUnmounted(() => {
  if (app) {
    app.stop()
  }
})

function handleCanvasClick(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Create random effect
  const effects = ['explosion', 'firework', 'confetti']
  const effect = effects[Math.floor(Math.random() * effects.length)]

  if (effect === 'explosion') {
    app.particles.explosion(x, y, 40)
  } else if (effect === 'firework') {
    app.particles.firework(x, y)
  } else {
    app.particles.confetti(x, y, 30)
  }
}

function handleMouseMove(e) {
  if (!mouseTrail) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  app.particles.sparkle(x, y, '#ffe66d')
}

function createExplosion() {
  const x = Math.random() * 700 + 100
  const y = Math.random() * 500 + 150
  app.particles.explosion(x, y, 50, '#ff6b6b')
}

function createFirework() {
  const x = Math.random() * 700 + 100
  const y = Math.random() * 400 + 150
  app.particles.firework(x, y)
}

function createConfetti() {
  const x = canvasRef.value.width / 2
  const y = 100
  app.particles.confetti(x, y, 50)
}



function createSmoke() {
  app.start(function* () {
    for (let i = 0; i < 20; i++) {
      const x = 450 + (Math.random() - 0.5) * 50
      const y = 600
      app.particles.smoke(x, y, '#666666')
      yield 100
    }
  }, 'smoke')
}

function multiFireworks() {
  app.start(function* () {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 700 + 100
      const y = Math.random() * 300 + 100
      app.particles.firework(x, y)
      yield 300
    }
  }, 'multi-fireworks')
}

function clearParticles() {
  // Stop all coroutines
  app.stopCoroutine('sparkles')
  app.stopCoroutine('smoke')
  app.stopCoroutine('multi-fireworks')

  // Remove all particles
  app.root.objects = app.root.objects.filter(obj => {
    return obj.message !== undefined || !obj.life
  })

  // Restart sparkle animation
  app.start(function* () {
    while (true) {
      const x = Math.random() * canvasRef.value.width
      const y = Math.random() * canvasRef.value.height
      app.particles.sparkle(x, y, '#ffffff')
      yield 200
    }
  }, 'sparkles')
}
</script>

<template>
  <div class="demo-container">
    <canvas ref="canvasRef"></canvas>

    <div class="controls">
      <div class="control-group">
        <h3>Single Effects</h3>
        <button @click="createExplosion">💥 Explosion</button>
        <button @click="createFirework">🎆 Firework</button>
        <button @click="createConfetti">🎉 Confetti</button>
        <button @click="createSmoke">💨 Smoke</button>
      </div>


      <div class="control-group">
        <h3>Special</h3>
        <button @click="multiFireworks">🎇 Multi Fireworks</button>
        <button @click="clearParticles" class="clear-btn">🗑️ Clear All</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

canvas {
  border: 2px solid #16f4d0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(22, 244, 208, 0.3);
  cursor: crosshair;
  background: #0a0a1a;
}

.controls {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: rgba(22, 244, 208, 0.05);
  border: 1px solid rgba(22, 244, 208, 0.2);
  border-radius: 8px;
}

.control-group h3 {
  margin: 0 0 5px 0;
  color: #16f4d0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

button {
  padding: 12px 20px;
  font-size: 15px;
  background: #16f4d0;
  color: #0a0a1a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

button:hover {
  background: #14d4b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 244, 208, 0.5);
}

button:active {
  transform: translateY(0);
}

.clear-btn {
  background: #ff6b6b;
  color: white;
}

.clear-btn:hover {
  background: #ff5252;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
}
</style>
