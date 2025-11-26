<template>
  <div ref="wrap" class="canvas-wrap">
    <canvas ref="el" />
  </div>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/*  1.  Import the two local libs                                     */
/* ------------------------------------------------------------------ */
import CanvasUtility from '../../utilities/canvas.js'   // ← adjust path
import Vector from '../../utilities/Vector.js'          // ← adjust path

/* ------------------------------------------------------------------ */
/*  2.  Vue utilities                                                 */
/* ------------------------------------------------------------------ */
import { ref, onMounted, onUnmounted } from 'vue'

/* ------------------------------------------------------------------ */
/*  3.  Refs                                                          */
/* ------------------------------------------------------------------ */
const el   = ref(null)   // canvas element
const wrap = ref(null)   // wrapper div
let cu     = null        // CanvasUtility instance
let raf    = null        // animation frame id

/* ------------------------------------------------------------------ */
/*  4.  Trail state                                                   */
/* ------------------------------------------------------------------ */
const TRAIL_LEN = 40
const trail = Array.from({ length: TRAIL_LEN }, () => new Vector(0, 0))
let mouse = new Vector(0, 0)

/* ------------------------------------------------------------------ */
/*  5.  Resize handler                                                */
/* ------------------------------------------------------------------ */
function resize() {
  if (!wrap.value || !el.value) return
  const rect = wrap.value.getBoundingClientRect()
  el.value.width  = rect.width  * devicePixelRatio
  el.value.height = rect.height * devicePixelRatio
  el.value.style.width  = rect.width  + 'px'
  el.value.style.height = rect.height + 'px'
  cu?.ctx?.scale(devicePixelRatio, devicePixelRatio)
}

/* ------------------------------------------------------------------ */
/*  6.  Mouse handler                                                 */
/* ------------------------------------------------------------------ */
function onMove(e) {
  const rect = el.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

/* ------------------------------------------------------------------ */
/*  7.  Render loop                                                   */
/* ------------------------------------------------------------------ */
function draw() {
  cu.save()
    .setCompositeOperation('source-over')
    .fill('rgba(10,10,20,.08)')          // faint fade for motion-blur

  // shift trail
  trail.pop()
  trail.unshift(mouse.clone())

  // draw trail
  trail.forEach((p, i) => {
    const size = 1 + (TRAIL_LEN - i) * 0.35
    const hue  = (i * 9) % 360
    cu.drawCircle(p.x, p.y, size, `hsl(${hue},100%,60%)`)
  })

  // glowing head
  cu.setShadow(0, 0, 20, 'rgba(255,255,255,.6)')
     .drawCircle(mouse.x, mouse.y, 5, '#fff')
     .clearShadow()

  cu.restore()
  raf = requestAnimationFrame(draw)
}

/* ------------------------------------------------------------------ */
/*  8.  Lifecycle                                                     */
/* ------------------------------------------------------------------ */
onMounted(() => {
  cu = new CanvasUtility(el.value)
  resize()
  window.addEventListener('resize', resize)
  el.value.addEventListener('mousemove', onMove)
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  el.value?.removeEventListener('mousemove', onMove)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.canvas-wrap {
  width: 100%;
  height: 100%;     /* fills parent; set fixed size if you prefer */
  min-height: 320px;
  background: #0a0a14;
  overflow: hidden;
}
canvas {
  display: block;
  cursor: crosshair;
}
</style>
