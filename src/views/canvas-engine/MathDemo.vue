<template>
  <section>
    <h2>Random canvas_util + mathPlugin usage</h2>

    <!-- 1. Full-screen canvas -->
    <canvas ref="el" width="640" height="360"></canvas>

    <!-- 2. Reactive controls -->
    <button @click="randomise">Randomise</button>
    <span>FPS: {{ fps }}</span>
  </section>
</template>

<script setup>
/* ---------------------------------------------
   1.  Imports
----------------------------------------------*/
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'


/* ---------------------------------------------
   2.  DOM ref & reactive state
----------------------------------------------*/
const el = ref(null)          // canvas element
const fps = ref(0)            // exposed FPS
let app = null                // canvas app instance


/* ---------------------------------------------
   3.  Helpers (pure functions – no external state)
----------------------------------------------*/
const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))


/* ---------------------------------------------
   4.  Random demo generators
   Each returns an object that is already added to a layer
----------------------------------------------*/
function spawnRandomThing() {
  const { vec2 } = app
  const { randomInt, chance, randomVec2 } = app.math


  const layer = app.createLayer(randInt(-5, 5))   // random z-index

  /* ---------- 4a. Random coloured particle burst ---------- */
  const particles = app.createParticleSystem({
    x: rand(50, 590),
    y: rand(50, 310),
    emissionRate: rand(20, 200),
    maxParticles: randomInt(30, 150),
    particleLife: rand(500, 2000)
  })

  /* ---------- 4b. Random text ---------- */
  app.createText(
    ['Hello', 'Vue', 'Canvas', '🎯'][randomInt(0, 3)],
    rand(0, 500),
    rand(0, 300),
    {
      font: `${randInt(16, 40)}px Arial`,
      color: `hsl(${randInt(0, 360)} 80% 60%)`
    }
  )

  /* ---------- 4c. Random sprite (we’ll draw a coloured rect as fallback) ---------- */
  const sprite = layer.add({
    x: rand(0, 640),
    y: rand(0, 360),
    rotation: rand(0, Math.PI * 2),
    scaleX: rand(0.5, 2),
    scaleY: rand(0.5, 2),
    colour: `hsl(${randInt(0, 360)} 70% 50%)`,
    update(dt) {
      this.rotation += 0.001 * dt
      this.x += Math.sin(this.rotation) * 0.1 * dt
      this.y += Math.cos(this.rotation) * 0.1 * dt
    },
    draw(ctx) {
      ctx.fillStyle = this.colour
      ctx.fillRect(-20, -20, 40, 40)
    }
  })

  /* ---------- 4d. Random vector field (mathPlugin) ---------- */
  if (chance(0.3)) {
    app.math.vectorField(
      (x, y) => randomVec2(2).add(vec2(x - 320, y - 180).normalized()), // noisy radial field
      { cellSize: randomInt(30, 60), arrowScale: rand(5, 15) }
    )
  }

  /* ---------- 4e. Random coroutine (tween something) ---------- */
  if (chance(0.4)) {
    const target = vec2(rand(0, 640), rand(0, 360))
    app.tween(
      sprite.toVec(),           // from
      target,                   // to
      rand(1000, 3000),         // duration
      v => sprite.fromVec(v),   // update
      app.math.ease.outElastic
    )
  }
}


/* ---------------------------------------------
   5.  Initialise canvas & plugins once DOM ready
----------------------------------------------*/
onMounted(async () => {
  app = createCanvasApp(el.value)   // create canvas app
  app.use(mathPlugin)               // inject math plugin

  /* expose FPS */
  app.start(function* () {
    while (true) {
      fps.value = Math.round(app.debug.fps)
      yield 500                       // update twice per second
    }
  })

  /* first random batch */
  for (let i = 0; i < 5; i++) spawnRandomThing()
})


/* ---------------------------------------------
   6.  Clean up when component unmounts
----------------------------------------------*/
onUnmounted(() => app?.stop())


/* ---------------------------------------------
   7.  UI callback
----------------------------------------------*/
function randomise() {
  /* wipe existing layers except root */
  app.layers.slice(1).forEach(l => l.clear())
  /* spawn new random things */
  for (let i = 0; i < 5; i++) spawnRandomThing()
}
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
  display: block;
  margin: 1rem 0;
}

button {
  margin-right: 1rem;
}
</style>
