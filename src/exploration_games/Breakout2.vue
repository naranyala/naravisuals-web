<template>
  <div class="modal" @click="emit('toggle-container')">
  <div class="game-container">
    <canvas ref="gameCanvas" width="800" height="600"></canvas>
    <div class="ui">
      <div>Score: {{ score }}</div>
      <div>Lives: {{ lives }}</div>
      <div v-if="gameOver" class="game-over">GAME OVER<br /><small>Click to restart</small></div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CanvasUtility from "../utilities/canvas.js"

const emit = defineEmits(['toggle-container'])

const gameCanvas = ref(null)
let cu = null

// Game state
const score = ref(0)
const lives = ref(3)
const gameOver = ref(false)

const paddle = {
  x: 350,
  y: 550,
  width: 100,
  height: 15,
  speed: 8
}

const ball = {
  x: 400,
  y: 500,
  radius: 8,
  vx: 4,
  vy: -4,
  color: '#60a5fa'
}

// Bricks: 10 cols x 5 rows
const BRICK_ROWS = 5
const BRICK_COLS = 10
const BRICK_WIDTH = 72
const BRICK_HEIGHT = 25
const BRICK_GAP = 8
const BRICK_START_X = 50
const BRICK_START_Y = 80

const bricks = ref([])

let animationId = null
let lastTime = 0

// Init bricks
const initBricks = () => {
  bricks.value = []
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.value.push({
        x: BRICK_START_X + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICK_START_Y + row * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: colors[row % colors.length],
        hits: 1  // Single hit destroy
      })
    }
  }
}

// Game loop
const gameLoop = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  const deltaTime = Math.min(timestamp - lastTime, 16) / 16  // ~60fps cap
  lastTime = timestamp

  update(deltaTime)
  render()

  if (!gameOver.value) {
    animationId = requestAnimationFrame(gameLoop)
  }
}

const update = (dt) => {
  if (gameOver.value) return

  // Paddle movement (mouse)
  // Handled in pointer event

  // Ball movement
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt

  // Wall collisions
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= 800) {
    ball.vx *= -1
  }
  if (ball.y - ball.radius <= 0) {
    ball.vy *= -1
  }
  if (ball.y + ball.radius >= 600) {
    lives.value--
    if (lives.value <= 0) {
      gameOver.value = true
      return
    }
    // Reset ball
    ball.x = 400
    ball.y = 500
    ball.vx = 4
    ball.vy = -4
    return
  }

  // Paddle collision
  if (ball.y + ball.radius >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
    ball.vy *= -1
    // Angle based on hit position
    const hitPos = (ball.x - paddle.x) / paddle.width - 0.5
    ball.vx += hitPos * 4
  }

  // Brick collisions
  for (let i = bricks.value.length - 1; i >= 0; i--) {
    const b = bricks.value[i]
    if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
        ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
      ball.vy *= -1
      bricks.value.splice(i, 1)
      score.value += 10
      break
    }
  }

  // Win?
  if (bricks.value.length === 0) {
    score.value += 1000  // Bonus
    gameOver.value = true
  }
}

const render = () => {
  cu.clear()

  // Starfield background
  const starsGrad = cu.createRadialGradient(400, 300, 0, 400, 300, 400, [
    { offset: 0, color: '#0f172a' },
    { offset: 0.5, color: '#1e293b' },
    { offset: 1, color: '#000000' }
  ])
  cu.drawRect(0, 0, 800, 600, starsGrad)

  // Subtle grid
  cu.ctx.globalAlpha = 0.1
  for (let x = 0; x < 800; x += 40) cu.drawLine(x, 0, x, 600, '#334155')
  for (let y = 0; y < 600; y += 40) cu.drawLine(0, y, 800, y, '#334155')
  cu.ctx.globalAlpha = 1

  // Bricks
  for (const brick of bricks.value) {
    const grad = cu.createLinearGradient(brick.x, brick.y, brick.x + brick.width, brick.y + brick.height, [
      { offset: 0, color: brick.color },
      { offset: 1, color: brick.color.replace('1', '4') }
    ])
    cu.setShadow(0, 3, 8, 'rgba(0,0,0,0.5)')
    cu.drawRoundedRect(brick.x, brick.y, brick.width, brick.height, 6, grad, '#ffffff', 2)
    cu.clearShadow()
  }

  // Paddle (rounded, gradient)
  const paddleGrad = cu.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y + paddle.height, [
    { offset: 0, color: '#64748b' },
    { offset: 1, color: '#334155' }
  ])
  cu.setShadow(0, 3, 10, 'rgba(0,0,0,0.4)')
  cu.drawRoundedRect(paddle.x, paddle.y, paddle.width, paddle.height, 8, paddleGrad, '#94a3b8', 3)
  cu.clearShadow()

  // Ball (glowing)
  cu.setShadow(0, 0, 20, ball.color + '66')
  const ballGrad = cu.createRadialGradient(ball.x - 4, ball.y - 4, 0, ball.x, ball.y, ball.radius, [
    { offset: 0, color: '#ffffff' },
    { offset: 0.7, color: ball.color },
    { offset: 1, color: '#1e40af' }
  ])
  cu.drawCircle(ball.x, ball.y, ball.radius, ballGrad, '#ffffff', 2)
  cu.clearShadow()
}

// Paddle control
const handlePointer = (e) => {
  if (!cu) return
  const rect = gameCanvas.value.getBoundingClientRect()
  const clientX = e.clientX ?? e.touches?.[0]?.clientX
  paddle.x = clientX - rect.left - paddle.width / 2

  // Clamp
  paddle.x = Math.max(0, Math.min(800 - paddle.width, paddle.x))
}

const restart = () => {
  score.value = 0
  lives.value = 3
  gameOver.value = false
  paddle.x = 350
  ball.x = 400
  ball.y = 500
  ball.vx = 4
  ball.vy = -4
  initBricks()
  animationId = requestAnimationFrame(gameLoop)
}

onMounted(() => {
  cu = new CanvasUtility(gameCanvas.value)

  const canvasEl = gameCanvas.value
  canvasEl.addEventListener('mousemove', handlePointer)
  canvasEl.addEventListener('touchmove', handlePointer, { passive: true })
  canvasEl.addEventListener('click', () => gameOver.value && restart())

  initBricks()
  animationId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  const canvasEl = gameCanvas.value
  if (canvasEl) {
    canvasEl.removeEventListener('mousemove', handlePointer)
    canvasEl.removeEventListener('touchmove', handlePointer)
  }
})
</script>

<style scoped>
.game-container {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  background: #000;
  border: 4px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
}

canvas {
  display: block;
  cursor: none;
}

.ui {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
}

.ui > div + div {
  margin-top: 5px;
}

.game-over {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.8);
  color: #ef4444;
  font-size: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: all;
  cursor: pointer;
}

.game-over small {
  font-size: 20px;
  margin-top: 20px;
  opacity: 0.8;
}



.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
