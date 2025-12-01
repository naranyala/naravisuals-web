<!-- CinematicOverdrive.vue -->
<template>
  <section>
    <canvas ref="stage" width="1280" height="720"></canvas>

    <div class="ui">
      <button @click="play">Play Cinematic</button>
      <button @click="reset">Reset</button>
    </div>
  </section>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/*  Imports                                                           */
/* ------------------------------------------------------------------ */
import { ref, onMounted, nextTick } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

/* ------------------------------------------------------------------ */
/*  Canvas & engine refs                                              */
/* ------------------------------------------------------------------ */
const stage = ref(null)
let app, tl   // tl = master timeline

/* ------------------------------------------------------------------ */
/*  Boot the engine once DOM is ready                                 */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  await nextTick()          // make sure canvas is in DOM
  app = createCanvasApp(stage.value)
  app.use(transitionPlugin)

  buildScene()              // create all visual objects
})

/* ------------------------------------------------------------------ */
/*  Build every asset we’ll animate                                   */
/* ------------------------------------------------------------------ */
let bgFar, bgMid, bgFront, title, glare, emitter

function buildScene() {
  /* ----- 3-layer parallax background ----- */
  bgFar = app.root.add(makeRect(640, 360, 1280, 720, '#0b0c2c'))
  bgMid = app.root.add(makeRect(640, 360, 1280, 720, '#1a1c4a'))
  bgFront = app.root.add(makeRect(640, 360, 1280, 720, '#2e3266'))

  /* ----- title text ----- */
  title = app.root.add(
    app.createText(640, 280, 'NEON GENESIS', {
      font: 'bold 92px "Orbitron", sans-serif',
      color: '#00f0ff',
      align: 'center',
      baseline: 'middle'
    })
  )
  title.visible = false

  /* ----- full-screen glare quad for holographic fx ----- */
  glare = app.root.add(
    makeRect(640, 360, 1280, 720, 'rgba(0,240,255,.06)')
  )
  glare.visible = false

  /* ----- emitter for synced burst ----- */
  emitter = app.createParticleEmitter({
    x: 640, y: 360, rate: 0,          // manual emit only
    lifetime: 1800, speed: 420,
    angle: -Math.PI / 2, spread: Math.PI,
    size: 6, color: '#00f0ff', gravity: 380,
    fade: true, maxParticles: 400
  })
  app.root.add({ update: dt => emitter.update(dt), draw: ctx => emitter.draw(ctx) })
}

/* ------------------------------------------------------------------ */
/*  Master timeline – edit this array to re-cut the entire sequence   */
/* ------------------------------------------------------------------ */
const timeline = [
  /* time(ms)  action */
  { t: 0, fn: () => slideParallaxIn() },
  { t: 400, fn: () => holographicTitleIn() },
  { t: 900, fn: () => app.transition.camera.shake(18, 450, true) },
  { t: 1400, fn: () => { emitter.emit(200); app.transition.camera.flash('#00f0ff', 200, .85) } },
  { t: 1800, fn: () => app.transition.camera.zoom(1.08, 700, 'easeOutQuad') },
  { t: 2600, fn: () => app.transition.camera.zoom(1, 900, 'easeInOut') },
  { t: 3400, fn: () => radialFadeOut() }
]

/* ------------------------------------------------------------------ */
/*  Control buttons                                                   */
/* ------------------------------------------------------------------ */
function play() {
  if (tl) tl.stop()                // kill previous run
  resetObjects()                   // scrub to start frame
  tl = app.timeline()
  timeline.forEach(({ t, fn }) => tl.add(t, fn))
  tl.play()
}
function reset() { resetObjects() }

/* ------------------------------------------------------------------ */
/*  Helper objects                                                    */
/* ------------------------------------------------------------------ */
function makeRect(x, y, w, h, fill) {
  return {
    x, y, width: w, height: h, color: fill,
    draw(ctx) { ctx.fillStyle = this.color; ctx.fillRect(-w / 2, -h / 2, w, h) }
  }
}

/* ------------------------------------------------------------------ */
/*  Sequence blocks                                                   */
/* ------------------------------------------------------------------ */
function slideParallaxIn() {
  const dur = 1200
  app.transition(bgFar, dur, 'easeOutCubic').to({ x: 640 - 60 }).play()
  app.transition(bgMid, dur, 'easeOutCubic').to({ x: 640 - 30 }).play()
  app.transition(bgFront, dur, 'easeOutCubic').to({ x: 640 }).play()
}
function holographicTitleIn() {
  title.visible = glare.visible = true
  title.scaleX = title.scaleY = .2; title.opacity = 0
  app.transition(title, 1000, 'easeOutElastic').to({ scaleX: 1, scaleY: 1, opacity: 1 }).play()
  // chromatic glitch
  app.transition.camera.chromaticAberration(12, 600)
  // subtle scanline flicker
  let f = 0, iv = setInterval(() => { glare.opacity = (f++ % 2) ? .08 : .03 }, 90)
  setTimeout(() => clearInterval(iv), 1000)
}
function radialFadeOut() {
  const overlay = app.root.add(makeRect(640, 360, 1280, 720, '#000'))
  overlay.opacity = 0
  app.transition(overlay, 1000, 'easeInQuart').to({ opacity: 1 }).then(() => resetObjects()).play()
}

/* ------------------------------------------------------------------ */
/*  Reset everything to hidden/initial state                          */
/* ------------------------------------------------------------------ */
function resetObjects() {
  bgFar.x = 640 - 60; bgMid.x = 640 - 30; bgFront.x = 640
  title.visible = glare.visible = false
  app.ctx.filter = 'none'
  app.camera.zoom = 1; app.camera.x = 0; app.camera.y = 0
}
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

canvas {
  background: #050609;
  border-radius: 8px;
  box-shadow: 0 0 24px #00f0ff44;
}

.ui button {
  margin: 1rem .5rem 0;
  padding: .6rem 1.4rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
