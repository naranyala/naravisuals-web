<template>
  <div class="lab">
    <h2>click the ball multiple times</h2>
    <canvas ref="cv" width="600" height="400" @click="launch" />

    <aside class="controls">
      <label>
        Attractor mass
        <input type="range" min="100" max="2000" v-model.number="mass" />
        <span>{{ mass }}</span>
      </label>

      <label>
        Attractor radius
        <input type="range" min="30" max="120" v-model.number="radius" />
        <span>{{ radius }}</span>
      </label>

      <label>
        Gravity strength
        <input type="range" min="10" max="500" v-model.number="G" />
        <span>{{ G }}</span>
      </label>

      <label>
        Particle damping
        <input type="range" min="0.90" max="1" step="0.005" v-model.number="damping" />
        <span>{{ damping.toFixed(3) }}</span>
      </label>

      <label class="check">
        Show trails
        <input type="checkbox" v-model="trails" />
      </label>

      <button @click="clearAll">Clear particles</button>

      <small>
        bodies: {{ bodies.length }} ‑ fps: {{ fps }}
      </small>
    </aside>
  </div>
</template>

<script setup>
/* ---------------------------------------------------------- */
/*  Gravity Lab – adjustable central attractor + click launch */
/* ---------------------------------------------------------- */
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { physicsPlugin } from '../../lib/engine/physicsPlugin.js'
import { collisionPlugin } from '../../lib/engine/collisionPlugin.js'

/* ---------- canvas & engine ---------- */
const cv = ref(null)
let app = null

/* ---------- ui state ---------- */
const mass = ref(600)
const radius = ref(60)
const G = ref(180)        // gravity constant (tunable)
const damping = ref(0.985)
const trails = ref(true)
const bodies = ref([])         // live particles
const fps = ref(0)

/* ---------- attractor object ---------- */
let attractor = null

/* ---------- helpers ---------- */
const rand = (min, max) => Math.random() * (max - min) + min
const distSq = (ax, ay, bx, by) => {
  const dx = bx - ax; const dy = by - ay; return dx * dx + dy * dy
}

onMounted(() => { })

/* ---------- bootstrap ---------- */
onMounted(() => {
  app = createCanvasApp(cv.value)



  // plug-ins
  physicsPlugin(app)
  collisionPlugin(app, { cellSize: 100, debug: false })

  // create static attractor
  attractor = app.physics.createCircle(450, 300, radius.value, {
    isStatic: true,
    color: '#ffcc00'
  })
  attractor.collisionTag = 'sun'

  // custom particle update that feels the attractor
  const updateGravity = (dt) => {
    const ax = attractor.x
    const ay = attractor.y
    bodies.value.forEach(p => {
      const dx = ax - p.x
      const dy = ay - p.y
      const r2 = Math.max(dx * dx + dy * dy, radius.value * radius.value)
      const f = (G.value * mass.value) / r2          // F = G·M/r²
      const fx = (dx / Math.sqrt(r2)) * f
      const fy = (dy / Math.sqrt(r2)) * f
      p.applyForce(fx, fy)
      p.friction = damping.value                     // live damping
    })
  }

  // add one global updater
  app.root.add({
    update(dt) {
      updateGravity(dt)
      // crude fps
      fps.value = Math.round(1000 / Math.max(dt, 1))
    },
    draw(ctx) {
      if (!trails.value) {
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, cv.value.width, cv.value.height)
      }
    }
  })

  // collision paint trick
  app.collision.on('particle', 'sun', 'enter', (p) => { p.color = '#ff0040' })
  app.collision.on('particle', 'sun', 'exit', (p) => { p.color = p.__origColor })


})

onUnmounted(() => app?.stop())

/* ---------- click to launch particle ---------- */
function launch(e) {
  const rect = cv.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // give tangential velocity for nice orbit
  const dx = x - attractor.x
  const dy = y - attractor.y
  const angle = Math.atan2(dy, dx) + Math.PI / 2
  const speed = rand(60, 160)
  const vx = Math.cos(angle) * speed
  const vy = Math.sin(angle) * speed

  const p = app.physics.createCircle(x, y, rand(4, 10), {
    vx, vy,
    restitution: 0.7,
    color: rndColor()
  })
  p.collisionTag = 'particle'
  p.__origColor = p.color
  bodies.value.push(p)
}

/* ---------- clear ---------- */
function clearAll() {
  bodies.value.forEach(b => app.physics.removeBody(b))
  bodies.value = []
}

/* ---------- attractor sync ---------- */
watch(radius, v => { attractor.radius = v })
watch(mass, v => { /* mass is only used in formula, no physical prop */ })

/* ---------- trail handling ---------- */
let trailCanvas = null
onMounted(() => {
  trailCanvas = document.createElement('canvas')
  trailCanvas.width = 600
  trailCanvas.height = 400
  const tctx = trailCanvas.getContext('2d')
  // faint persistent trail
  app.root.add({
    draw(ctx) {
      if (!trails.value) return
      tctx.fillStyle = 'rgba(17,17,17,0.03)'
      tctx.fillRect(0, 0, 900, 600)
      ctx.drawImage(trailCanvas, 0, 0)
    }
  })
})

/* ---------- tiny utils ---------- */
const rndColor = () => `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`
</script>

<style scoped>
.lab {
  display: flex;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  border-radius: 8px;
  color: #eee;
  font: 14px/1.2 sans-serif;
}

canvas {
  background: #000;
  border-radius: 4px;
  cursor: crosshair;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  min-width: 220px;
}

label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input[type=range] {
  width: 100px;
}

.check {
  justify-content: flex-start;
  gap: .5rem;
}

button {
  align-self: flex-start;
  padding: .3rem .8rem;
  cursor: pointer;
}

small {
  margin-top: .2rem;
  opacity: .7;
}
</style>
