<template>
  <div class="demo">
    <canvas ref="cv" width="800" height="400" />
    <div class="hud">
      <span>bodies: {{ bodies.length }}</span>
      <button @click="clearAll">Clear</button>
    </div>
  </div>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/*  Vue 3  <script setup>  –  random physics + collision playground   */
/* ------------------------------------------------------------------ */
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 1.  import the three plugins (adjust path to your folder structure)
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { physicsPlugin } from '../../lib/engine/physicsPlugin.js'
import { collisionPlugin } from '../../lib/engine/collisionPlugin.js'

/* ---------- reactive ---------- */
const cv = ref(null)          // canvas element
let app = null               // canvas_app instance
let bodies = ref([])            // live physics bodies

/* ---------- helpers ---------- */
const rand = (min, max) => Math.random() * (max - min) + min
const rndColor = () => `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`

/* ---------- lifecycle ---------- */
onMounted(() => {
  // 2.  bootstrap the engine
  app = createCanvasApp(cv.value)

  // 3.  plug physics + collision
  physicsPlugin(app)
  collisionPlugin(app, { cellSize: 120, debug: false })

  // 4.  spawn loop
  const spawner = setInterval(() => {
    if (bodies.value.length > 60) return          // cap bodies

    const isCircle = Math.random() < 0.6
    const x = rand(40, 760)
    const y = rand(40, 160)
    const color = rndColor()

    if (isCircle) {
      const r = rand(8, 20)
      const c = app.physics.createCircle(x, y, r, {
        vx: rand(-80, 80),
        vy: rand(-40, 40),
        restitution: rand(0.6, 0.95),
        color
      })
      c.collisionTag = 'orb'
      bodies.value.push(c)
    } else {
      const w = rand(15, 30)
      const h = rand(15, 30)
      const b = app.physics.createRect(x, y, w, h, {
        vx: rand(-80, 80),
        vy: rand(-40, 40),
        restitution: rand(0.5, 0.9),
        color
      })
      b.collisionTag = 'box'
      bodies.value.push(b)
    }
  }, 400)

  // 5.  collision paint trick: turn triggers red while touching
  app.collision.on('orb', 'box', 'stay', (orb, box) => {
    const old = orb.color
    orb.color = '#ff0040'
    setTimeout(() => { orb.color = old }, 120)
  })

  // 6.  expose clear function
  window.addEventListener('beforeunload', () => clearInterval(spawner))
})

onUnmounted(() => {
  app?.stop()
})

/* ---------- methods ---------- */
function clearAll() {
  app.physics.clear()
  bodies.value = []
}
</script>

<style scoped>
.demo {
  display: inline-block;
  background: #111;
  border-radius: 8px;
  padding: .5rem;
}

canvas {
  display: block;
  background: #222;
  border-radius: 4px;
}

.hud {
  margin-top: .5rem;
  color: #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 14px/1 sans-serif;
}

button {
  padding: .25rem .75rem;
  font: inherit;
  cursor: pointer;
}
</style>
