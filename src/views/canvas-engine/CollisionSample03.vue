<template>
  <div class="range">
    <canvas ref="cv" width="600" height="450" />

    <aside class="controls">
      <label>
        Speed
        <input type="range" min="20" max="110" v-model.number="speed" />
        <span>{{ speed }}</span>
      </label>

      <label>
        Angle
        <input type="range" min="5" max="85" v-model.number="angle" />
        <span>{{ angle }}°</span>
      </label>

      <button @click="fire">🔥 Fire</button>
      <button @click="reset">Reset</button>

      <div class="score">Hits: {{ hits }} / {{ shots }}</div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { physicsPlugin } from '../../lib/engine/physicsPlugin.js'
import { collisionPlugin } from '../../lib/engine/collisionPlugin.js'

/* ---------- canvas ---------- */
const cv = ref(null)
let app = null

/* ---------- ui ---------- */
const speed = ref(70)
const angle = ref(35)
const hits = ref(0)
const shots = ref(0)

/* ---------- constants ---------- */
const CANNON_X = 80        // barrel pivot
const CANNON_Y = 380
const TARGET_X = 750       // centre of circular range
const TARGET_Y = 250
const TARGET_R = 80        // hit-ring radius

/* ---------- helpers ---------- */
const rad = a => a * Math.PI / 180
const cos = a => Math.cos(rad(a))
const sin = a => Math.sin(rad(a))

/* ---------- bootstrap ---------- */
onMounted(() => {
  app = createCanvasApp(cv.value)
  physicsPlugin(app)
  collisionPlugin(app, { cellSize: 100, debug: false })

  /* ground */
  app.physics.setBounds(0, -100, 900, 450)
  app.physics.createRect(450, 440, 900, 20, { isStatic: true, color: '#654' })

  /* ---------- circular target ---------- */
  const ringLayer = app.createLayer(5)
  // hit-ring
  const ring = app.createCircle(TARGET_X, TARGET_Y, TARGET_R, '#0f0')
  ring.draw = ctx => {
    ctx.strokeStyle = ring.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, TARGET_R, 0, Math.PI * 2)
    ctx.stroke()
  }
  ring.opacity = 0.4
  ringLayer.add(ring)

  // cross-hair
  const cross = app.createCircle(TARGET_X, TARGET_Y, 4, '#fff')
  cross.draw = ctx => {
    ctx.strokeStyle = cross.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-10, 0); ctx.lineTo(10, 0)
    ctx.moveTo(0, -10); ctx.lineTo(0, 10)
    ctx.stroke()
  }
  cross.opacity = 0.9
  ringLayer.add(cross)

  /* ---------- natural cannon barrel ---------- */
  const barrelLayer = app.createLayer(15)
  const barrel = app.createRect(CANNON_X, CANNON_Y, 70, 12, '#556')
  barrel.draw = ctx => {
    ctx.save()
    ctx.translate(barrel.x, barrel.y)
    ctx.rotate(-rad(angle.value)) // negative = up
    ctx.fillStyle = barrel.color
    ctx.fillRect(-35, -6, 70, 12)
    ctx.restore()
  }
  barrelLayer.add(barrel)

  /* predictive trajectory (same as before) */
  const trajLayer = app.createLayer(10)
  const trajDot = app.createCircle(0, 0, 2, '#f0f')
  trajDot.opacity = 0.6
  trajLayer.add(trajDot)

  app.root.add({
    update() {
      trajLayer.objects = []
      const g = 0.5 * 60
      const vx = speed.value * cos(angle.value)
      const vy = -speed.value * sin(angle.value)
      let px = CANNON_X, py = CANNON_Y
      for (let t = 0; t < 3; t += 0.08) {
        const x = px + vx * t * 60
        const y = py + vy * t * 60 + 0.5 * g * t * t * 60 * 60
        if (y > 450 || x > 900) break
        const dot = { ...trajDot, x, y }
        trajLayer.objects.push(dot)
      }
    }
  })

  /* ---------- scoring ---------- */
  app.collision.on('shell', 'target', 'enter', () => { hits.value++ })
})

onUnmounted(() => app?.stop())

/* ---------- fire ---------- */
function fire() {
  shots.value++
  const vx = speed.value * cos(angle.value)
  const vy = -speed.value * sin(angle.value)
  const shell = app.physics.createCircle(CANNON_X, CANNON_Y, 8, {
    vx, vy,
    restitution: 0.4,
    color: '#ff0'
  })
  shell.collisionTag = 'shell'
}

/* ---------- reset ---------- */
function reset() {
  app.physics.getBodies()
    .filter(b => b.collisionTag === 'shell')
    .forEach(b => app.physics.removeBody(b))
  hits.value = 0
  shots.value = 0
}
</script>

<style scoped>
.range {
  display: flex;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  border-radius: 8px;
}

canvas {
  background: #000;
  border-radius: 4px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  min-width: 200px;
  color: #eee;
  font: 14px/1.2 sans-serif;
}

label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input[type=range] {
  width: 100px;
}

button {
  align-self: flex-start;
  padding: .4rem .8rem;
  cursor: pointer;
}

.score {
  margin-top: .5rem;
  font-size: 18px;
  font-weight: bold;
}
</style>
