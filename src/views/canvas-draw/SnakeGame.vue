<template>
  <div class="snake-wrap">
    <canvas ref="el" tabindex="0" @keydown.prevent="onKey" />
    <div class="ui">
      <div>Score: {{ score }}</div>
      <button v-if="gameOver" @click="start">Restart</button>
    </div>
  </div>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/*  1.  Import local libs                                             */
/* ------------------------------------------------------------------ */
import CanvasUtility from '../../utilities/canvas.js'   // ← adjust path
import Vector from '../../utilities/Vector.js'          // ← adjust path

/* ------------------------------------------------------------------ */
/*  2.  Vue stuff                                                     */
/* ------------------------------------------------------------------ */
import { ref, onMounted, onUnmounted } from 'vue'

/* ------------------------------------------------------------------ */
/*  3.  Config constants                                              */
/* ------------------------------------------------------------------ */
const CELL   = 18              // cell size (px)
const COLS   = 30              // board width  (cells)
const ROWS   = 20              // board height (cells)
const WIDTH  = COLS * CELL
const HEIGHT = ROWS * CELL
const FPS    = 8               // snakes per second

/* ------------------------------------------------------------------ */
/*  4.  State                                                         */
/* ------------------------------------------------------------------ */
const el       = ref(null)     // canvas
let cu         = null          // CanvasUtility
let raf        = null          // animation id
let last       = 0             // last frame timestamp

const score    = ref(0)
const gameOver = ref(false)

let snake      = []            // Array<Vector>
let dir        = new Vector(1, 0)   // current direction
let nextDir    = new Vector(1, 0)   // buffered direction
let food       = new Vector(0, 0)
let timer      = 0             // accumulator for fixed timestep

/* ------------------------------------------------------------------ */
/*  5.  Helpers                                                       */
/* ------------------------------------------------------------------ */
const randCell = () => new Vector(
  Math.floor(Math.random() * COLS),
  Math.floor(Math.random() * ROWS)
)

// place food that is not on snake
function placeFood() {
  do food = randCell()
  while (snake.some(s => s.equals(food)))
}

// reset full game
function start() {
  snake   = [new Vector(Math.floor(COLS / 2), Math.floor(ROWS / 2))]
  dir     = new Vector(1, 0)
  nextDir = new Vector(1, 0)
  score.value = 0
  gameOver.value = false
  placeFood()
}

// handle keyboard
function onKey(e) {
  if (gameOver.value) return
  switch (e.key) {
    case 'ArrowUp':    if (dir.y === 0) nextDir = new Vector(0, -1); break
    case 'ArrowDown':  if (dir.y === 0) nextDir = new Vector(0, 1); break
    case 'ArrowLeft':  if (dir.x === 0) nextDir = new Vector(-1, 0); break
    case 'ArrowRight': if (dir.x === 0) nextDir = new Vector(1, 0); break
  }
}

/* ------------------------------------------------------------------ */
/*  6.  Game step                                                     */
/* ------------------------------------------------------------------ */
function step() {
  dir = nextDir.clone()
  const head = snake[0].add(dir)

  // wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    gameOver.value = true
    return
  }
  // self collision
  if (snake.some(s => s.equals(head))) {
    gameOver.value = true
    return
  }

  snake.unshift(head)          // grow head

  // eat food
  if (head.equals(food)) {
    score.value += 1
    placeFood()
  } else {
    snake.pop()                // keep tail if no food
  }
}

/* ------------------------------------------------------------------ */
/*  7.  Render                                                        */
/* ------------------------------------------------------------------ */
function draw() {
  cu.clear()
    .fill('#111')                                    // background
    .setShadow(0, 0, 8, 'rgba(0,255,100,.6)')
  // draw snake
  snake.forEach((s, i) => {
    const color = i === 0 ? '#4fffa0' : '#2dd36f'
    cu.drawRect(s.x * CELL, s.y * CELL, CELL - 2, CELL - 2, color)
  })
  cu.clearShadow()
  // draw food
  cu.drawCircle(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2 - 1,
    '#ff4d6d'
  )
}

/* ------------------------------------------------------------------ */
/*  8.  Loop                                                          */
/* ------------------------------------------------------------------ */
function loop(ts) {
  if (!last) last = ts
  const dt = (ts - last) / 1000
  last = ts
  timer += dt
  while (timer >= 1 / FPS && !gameOver.value) {
    timer -= 1 / FPS
    step()
  }
  draw()
  raf = requestAnimationFrame(loop)
}

/* ------------------------------------------------------------------ */
/*  9.  Lifecycle                                                     */
/* ------------------------------------------------------------------ */
onMounted(() => {
  cu = new CanvasUtility(el.value)
  el.value.width  = WIDTH
  el.value.height = HEIGHT
  el.value.focus()
  start()
  loop(0)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.snake-wrap {
  display: inline-block;
  position: relative;
  background: #000;
  border: 2px solid #333;
  border-radius: 6px;
  overflow: hidden;
}
canvas {
  display: block;
  outline: none;
}
.ui {
  position: absolute;
  top: 6px;
  left: 10px;
  color: #4fffac;
  font-family: monospace;
  font-size: 16px;
  user-select: none;
}
button {
  margin-left: 12px;
  padding: 2px 8px;
  font: inherit;
  cursor: pointer;
}
</style>
