<template>
  <div class="wrapper">
    <canvas ref="canvas" width="800" height="600" />
    <div class="hud">
      3-D Earth-Moon Orbit<br>
      Drag to orbit camera · Wheel to zoom · ↑↓ change speed<br>
      Orbit Speed: {{ (orbitSpeed * 1000).toFixed(1) }}x
    </div>
  </div>
</template>

<script setup>
/* -------------------------------------  imports  ------------------------------------- */
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { linearAlgebraPlugin } from '../../lib/engine/linearAlgebraPlugin.js'

/* -------------------------------------  refs / state  -------------------------------- */
const canvas = ref(null)
let app = null
let orbitSpeed = $ref(0.01)          // reactive

/* -------------------------------------  helpers  ------------------------------------- */
const { Vector3, Matrix4, Vec3 } = await (async () => {
  const tmp = {};                 // small helper to grab plugin classes
  linearAlgebraPlugin({ use: (p) => Object.assign(tmp, p.linalg) })
  return tmp
})()

/* -------------------------------------  lifecycle  ----------------------------------- */
onMounted(() => {
  /* 1. boot engine ------------------------------------------------------------------- */
  app = createCanvasApp(canvas.value)
  app.use(linearAlgebraPlugin)
  const { lerp, clamp, distance, randomRange } = app

  /* 2. camera ------------------------------------------------------------------------ */
  const cam = (() => {
    const eye = new Vector3(0, 0, 400)
    const center = new Vector3(0, 0, 0)
    const up = new Vector3(0, 1, 0)
    let rotX = 0.2, rotY = 0                        // radians
    let zoom = 1
    let dirty = true

    function updateMatrix() {
      const m = Matrix4.identity()
        .multiply(Matrix4.rotationX(rotX))
        .multiply(Matrix4.rotationY(rotY))
        .multiply(Matrix4.scaling(zoom, zoom, zoom))
        .multiply(Matrix4.lookAt(eye, center, up))
      return m
    }
    return { rotX, rotY, zoom, dirty, updateMatrix }
  })()

  /* 3. project 3-D → 2-D ------------------------------------------------------------- */
  function project(v) {                       // v in world → {x,y,r} in canvas
    const m = cam.updateMatrix()
    const v2 = m.transformVector3(v)        // view space
    const perspective = 600                 // fake focal length
    const z = v2.z + 0.001                  // avoid div 0
    const sx = canvas.value.width / 2
    const sy = canvas.value.height / 2
    return {
      x: sx + (v2.x * perspective) / z,
      y: sy - (v2.y * perspective) / z,      // canvas y ↓
      r: perspective / z                     // pseudo-radius
    }
  }

  /* 4. layers ------------------------------------------------------------------------ */
  const starsLayer = app.createLayer(0)
  const spaceLayer = app.createLayer(1)

  /* 5. star field -------------------------------------------------------------------- */
  for (let i = 0; i < 300; i++) {
    const v = new Vector3(
      randomRange(-1, 1),
      randomRange(-1, 1),
      randomRange(-1, 1)
    ).norm().mul(randomRange(800, 1500))
    const s = app.createCircle(0, 0, 0, 'white')
    s.update = () => {
      const p = project(v)
      s.x = p.x; s.y = p.y; s.radius = clamp(p.r * 0.5, 0.5, 3)
    }
    starsLayer.add(s)
  }

  /* 6. Earth ------------------------------------------------------------------------- */
  const earthPos = new Vector3(0, 0, 0)
  const earth = app.createCircle(0, 0, 0, '#4169E1')
  spaceLayer.add(earth)

  /* 7. Earth glow -------------------------------------------------------------------- */
  const glow = app.createCircle(0, 0, 0, '')
  glow.draw = (ctx) => {
    const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius)
    g.addColorStop(0, 'rgba(65,105,225,.35)')
    g.addColorStop(1, 'rgba(65,105,225,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(glow.x, glow.y, glow.radius, 0, Math.PI * 2); ctx.fill()
  }
  spaceLayer.add(glow)

  /* 8. orbit ring -------------------------------------------------------------------- */
  const orbitAxis = new Vector3(0, 1, 0.4).norm()        // tilt
  const orbitRadius = 120
  const orbitPts = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    const q = new Vector3(Math.cos(a), 0, Math.sin(a))
      .rotate(orbitAxis, Math.acos(orbitAxis.dot(new Vector3(0, 1, 0))))
    orbitPts.push(q.mul(orbitRadius))
  }
  const orbitLine = {
    pts2: [],
    draw(ctx) {
      if (this.pts2.length < 2) return
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(this.pts2[0].x, this.pts2[0].y)
      for (let i = 1; i < this.pts2.length; i++) ctx.lineTo(this.pts2[i].x, this.pts2[i].y)
      ctx.stroke()
    }
  }
  spaceLayer.add(orbitLine)

  /* 9. Moon -------------------------------------------------------------------------- */
  const moonPos = new Vector3(0, 0, 0)
  let orbitAngle = 0
  const moon = app.createCircle(0, 0, 0, '#C0C0C0')
  spaceLayer.add(moon)

  /* 10. moon particle trail ----------------------------------------------------------- */
  const trail = app.createParticleEmitter({
    x: 0, y: 0, rate: 30, lifetime: 1000, speed: 0,
    size: 3, color: '#C0C0C0', fade: true, maxParticles: 50
  })
  spaceLayer.add(trail)

  /* 11. update loop ------------------------------------------------------------------- */
  const updateBodies = (dt) => {
    orbitAngle += orbitSpeed * dt
    const q = new Vector3(Math.cos(orbitAngle), 0, Math.sin(orbitAngle))
      .rotate(orbitAxis, Math.acos(orbitAxis.dot(new Vector3(0, 1, 0))))
    moonPos.set(q.x * orbitRadius, q.y * orbitRadius, q.z * orbitRadius)

    // project
    const e = project(earthPos), m = project(moonPos)
    earth.x = e.x; earth.y = e.y; earth.radius = clamp(e.r * 50, 10, 200)
    moon.x = m.x; moon.y = m.y; moon.radius = clamp(m.r * 15, 3, 60)
    glow.x = e.x; glow.y = e.y; glow.radius = earth.radius * 1.35

    // orbit line
    orbitLine.pts2 = orbitPts.map(p => project(p.add(earthPos)))

    // trail
    trail.x = moon.x; trail.y = moon.y; trail.update(dt)
  }
  earth.update = updateBodies
  moon.update = () => { }   // already handled above

  /* 12. camera mouse control ---------------------------------------------------------- */
  let drag = false, lastX = 0, lastY = 0
  canvas.value.onpointerdown = (e) => { drag = true; lastX = e.clientX; lastY = e.clientY }
  canvas.value.onpointermove = (e) => {
    if (!drag) return
    const dx = e.clientX - lastX, dy = e.clientY - lastY
    cam.rotY += dx * 0.01
    cam.rotX = clamp(cam.rotX - dy * 0.01, -Math.PI / 2, Math.PI / 2)
    lastX = e.clientX; lastY = e.clientY
  }
  canvas.value.onpointerup = () => drag = false
  canvas.value.onwheel = (e) => {
    e.preventDefault()
    cam.zoom = clamp(cam.zoom - e.deltaY * 0.001, 0.3, 3)
  }

  /* 13. keyboard speed ---------------------------------------------------------------- */
  const onKey = (e) => {
    if (e.key === 'ArrowUp') orbitSpeed = Math.min(orbitSpeed + 0.001, 0.1)
    if (e.key === 'ArrowDown') orbitSpeed = Math.max(orbitSpeed - 0.001, 0.0005)
  }
  window.addEventListener('keydown', onKey)

  /* 14. clean-up ---------------------------------------------------------------------- */
  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
    app.stop()
  })
})
</script>

<style scoped>
.wrapper {
  position: relative;
  display: inline-block;
  background: #000;
}

canvas {
  border: 1px solid #333;
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.hud {
  position: absolute;
  top: 10px;
  left: 10px;
  font: 14px/1.4 monospace;
  color: #fff;
  pointer-events: none;
}
</style>
