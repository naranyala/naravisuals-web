<template>
  <div class="wrap">
    <canvas ref="el" width="640" height="360"></canvas>
    <p>Bullets left: {{ bulletsLeft }} – Enemies: {{ enemiesCount }}</p>
  </div>
</template>

<script setup>
/* ----------------------------------------------------------
   0.  Import the three engine files (keep them in /src/lib/…)
---------------------------------------------------------- */
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapePlugin } from '../../lib/engine/shapePlugin.js'
import { collisionPlugin } from '../../lib/engine/collisionPlugin.js'

/* ----------------------------------------------------------
   1.  Vue glue
---------------------------------------------------------- */
import { ref, onMounted, onUnmounted, computed } from 'vue'
const el = ref(null)
let app, stop

const bricksLeft = ref(0)

/* ----------------------------------------------------------
   2.  scene constants
---------------------------------------------------------- */
const W = 640
const H = 400
const COLS = 10
const ROWS = 5
const BRICK_W = 60
const BRICK_H = 18
const BRICK_GAP = 4

/* ----------------------------------------------------------
   3.  helpers
---------------------------------------------------------- */
function makeWall() {
  bricksLeft.value = 0
  const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93']
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const b = app.shapes.rect(
        col * (BRICK_W + BRICK_GAP) + BRICK_W / 2 + BRICK_GAP,
        row * (BRICK_H + BRICK_GAP) + BRICK_H / 2 + BRICK_GAP + 40,
        BRICK_W, BRICK_H,
        colors[row % colors.length]
      )
      b.collisionTag = 'brick'
      b.row = row
      b.col = col
      bricksLeft.value++
    }
  }
}

/* ----------------------------------------------------------
   4.  build scene
---------------------------------------------------------- */
onMounted(() => {
  app = createCanvasApp(el.value)
  app.use(shapePlugin)
  app.use(collisionPlugin)
  stop = () => app.stop()

  /* ---- paddle ---- */
  const paddle = app.shapes.rect(W / 2, H - 30, 90, 12, '#fff')
  paddle.collisionTag = 'paddle'
  el.value.addEventListener('pointermove', e => {
    const r = el.value.getBoundingClientRect()
    paddle.x = e.clientX - r.left
    paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x))
  })

  /* ---- ball ---- */
  const ball = app.shapes.circle(W / 2, H / 2, 7, '#fff')
  ball.collisionTag = 'ball'
  ball.vx = 220
  ball.vy = -280

  /* ---- brick wall ---- */
  makeWall()

  /* ---- ball motion + wall bounce ---- */
  app.start(function* () {
    while (true) {
      const dt = yield 16
      ball.x += ball.vx * dt / 1000
      ball.y += ball.vy * dt / 1000

      if (ball.x - ball.r < 0 || ball.x + ball.r > W) ball.vx *= -1
      if (ball.y - ball.r < 0) ball.vy *= -1
      if (ball.y + ball.r > H) {   // floor = reset
        ball.x = W / 2
        ball.y = H / 2
        ball.vx = 220 * (Math.random() > .5 ? 1 : -1)
        ball.vy = -280
      }
    }
  })

  /* ---- collisions ---- */
  app.collision.on('ball', 'brick', (ball, brick) => {
    app.root.remove(brick)
    app.collision.untrack(brick)
    bricksLeft.value--
    ball.vy *= -1   // simple bounce
    if (bricksLeft.value === 0) {
      app.start(function* () {
        yield 500      // short pause
        makeWall()
      })
    }
  })
  app.collision.on('ball', 'paddle', (ball) => {
    ball.vy = -Math.abs(ball.vy)   // always go up
    const delta = (ball.x - paddle.x) / (paddle.w / 2)
    ball.vx = delta * 220          // angle depends on hit position
  })
})

/* ----------------------------------------------------------
   5.  clean up
---------------------------------------------------------- */
onUnmounted(() => stop?.())
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
}

canvas {
  border: 1px solid #444;
  background: #111;
  cursor: none;
}

p {
  margin-top: 8px;
  color: #eee;
}
</style>
