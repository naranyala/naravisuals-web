<template>
  <div class="modal" @click="emit('toggle-container')">
  <div class="game-container">
    <canvas ref="gameCanvas" width="600" height="600"></canvas>
    <div class="ui">
      <div>Score: {{ score }}</div>
      <div v-if="gameOver" class="game-over">
        GAME OVER<br />
        <small>Click or press any key to restart</small>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import CanvasUtility from "../utilities/canvas.js"

const emit = defineEmits(['toggle-container'])

const gameCanvas = ref(null)
let cu = null

// Game constants
const GRID_SIZE = 20
const GRID_WIDTH = 600 / GRID_SIZE   // 30
const GRID_HEIGHT = 600 / GRID_SIZE  // 30

// Game state
const score = ref(0)
const gameOver = ref(false)
const direction = ref({ x: 1, y: 0 })  // current direction
const nextDirection = ref({ x: 1, y: 0 }) // queued direction (prevents instant reverse)

// Snake as array of {x, y}
const snake = ref([
  { x: 15, y: 15 }
])

// Food
const food = ref({ x: 20, y: 20 })

let animationId = null
let lastTime = 0
const FPS = 10  // Snake speed (updates per second)

const gameLoop = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  const delta = timestamp - lastTime

  if (delta > 1000 / FPS) {
    update()
    render()
    lastTime = timestamp
  }

  if (!gameOver.value) {
    animationId = requestAnimationFrame(gameLoop)
  }
}

const update = () => {
  if (gameOver.value) return

  // Apply queued direction (prevents 180° turn into itself)
  direction.value = nextDirection.value

  const head = { ...snake.value[0] }
  head.x += direction.value.x
  head.y += direction.value.y

  // Wall collision
  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    endGame()
    return
  }

  // Self collision
  if (snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame()
    return
  }

  snake.value.unshift(head)  // add new head

  // Food eaten?
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    spawnFood()
  } else {
    snake.value.pop()  // remove tail
  }
}

const spawnFood = () => {
  while (true) {
    const x = Math.floor(Math.random() * GRID_WIDTH)
    const y = Math.floor(Math.random() * GRID_HEIGHT)
    if (!snake.value.some(s => s.x === x && s.y === y)) {
      food.value = { x, y }
      break
    }
  }
}

const render = () => {
  cu.clear()

  // Background
  const bgGrad = cu.createLinearGradient(0, 0, 600, 600, [
    { offset: 0, color: '#0f172a' },
    { offset: 1, color: '#1e293b' }
  ])
  cu.drawRect(0, 0, 600, 600, bgGrad)

  // Grid lines (optional subtle)
  cu.ctx.globalAlpha = 0.15
  for (let i = 0; i <= GRID_WIDTH; i++) {
    cu.drawLine(i * GRID_SIZE, 0, i * GRID_SIZE, 600, '#475569', 1)
  }
  for (let i = 0; i <= GRID_HEIGHT; i++) {
    cu.drawLine(0, i * GRID_SIZE, 600, i * GRID_SIZE, '#475569', 1)
  }
  cu.ctx.globalAlpha = 1

  // Draw snake
  snake.value.forEach((segment, i) => {
    const isHead = i === 0
    const x = segment.x * GRID_SIZE
    const y = segment.y * GRID_SIZE

    if (isHead) {
      // Head with eyes
      cu.drawRoundedRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 6,
        '#22c55e',
        '#16a34a',
        3
      )
      // Eyes
      cu.drawCircle(x + 7, y + 7, 3, 'white')
      cu.drawCircle(x + 13, y + 7, 3, 'white')
      cu.drawCircle(x + 7, y + 7, 1.5, 'black')
      cu.drawCircle(x + 13, y + 7, 1.5, 'black')
    } else {
      cu.drawRoundedRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 6,
        i < snake.value.length - 1 ? '#4ade80' : '#86efac',
        '#22c55e',
        2
      )
    }
  })

  // Draw food (shiny apple style)
  const fx = food.value.x * GRID_SIZE + GRID_SIZE / 2
  const fy = food.value.y * GRID_SIZE + GRID_SIZE / 2
  const grad = cu.createRadialGradient(fx - 5, fy - 5, 0, fx, fy, 12, [
    { offset: 0, color: '#fca5a5' },
    { offset: 1, color: '#ef4444' }
  ])
  cu.drawCircle(fx, fy, 12, grad, '#dc2626', 3)
  cu.setShadow(0, 0, 8, 'rgba(0,0,0,0.4)')
  cu.drawCircle(fx - 4, fy - 6, 4, '#86efac')
  cu.clearShadow()
}

const endGame = () => {
  gameOver.value = true
  cancelAnimationFrame(animationId)
}

const restart = async () => {
  snake.value = [{ x: 15, y: 15 }]
  direction.value = { x: 1, y: 0 }
  nextDirection.value = { x: 1, y: 0 }
  score.value = 0
  gameOver.value = false
  spawnFood()
  lastTime = 0
  await nextTick()
  animationId = requestAnimationFrame(gameLoop)
}

// Controls
const handleKey = (e) => {
  if (gameOver.value && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault()
    restart()
    return
  }

  const key = e.key
  if (key === 'ArrowUp' && direction.value.y === 0) {
    nextDirection.value = { x: 0, y: -1 }
  } else if (key === 'ArrowDown' && direction.value.y === 0) {
    nextDirection.value = { x: 0, y: 1 }
  } else if (key === 'ArrowLeft' && direction.value.x === 0) {
    nextDirection.value = { x: -1, y: 0 }
  } else if (key === 'ArrowRight' && direction.value.x === 0) {
    nextDirection.value = { x: 1, y: 0 }
  }
  e.preventDefault()
}

onMounted(() => {
  cu = new CanvasUtility(gameCanvas.value)
  document.addEventListener('keydown', handleKey)
  gameCanvas.value.addEventListener('click', () => gameOver.value && restart())

  spawnFood()
  animationId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.game-container {
  position: relative;
  width: 600px;
  height: 600px;
  margin: 2rem auto;
  background: #000;
  border: 6px solid #1e293b;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}

canvas {
  display: block;
}

.ui {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 32px;
  text-shadow: 2px 2px 8px black;
  pointer-events: none;
  z-index: 10;
}

.game-over {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.8);
  color: #fca5a5;
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
