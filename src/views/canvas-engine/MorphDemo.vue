<script setup>
// import { onMounted, onUnmounted } from 'vue'
// import { createCanvasApp } from './canvas_util.js'
// import { shapesPlugin } from './shapesPlugin.js'
// import { morphPlugin } from './morphPlugin.js'

import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js';
import { morphPlugin } from '../../lib/engine/morphPlugin.js';


let app = null
let morphingShape = null

const randomPastel = () => {
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 80%, 65%)`
}

const morphPresets = [
  { action: (s) => app.morph.toCircle(s, 80 + Math.random() * 70, 900, { colorTo: randomPastel() }) },
  { action: (s) => app.morph.toStar(s, 130, 25 + Math.random() * 45, 1100, { colorTo: randomPastel() }) },
  { action: (s) => app.morph.toPolygon(s, 3 + Math.floor(Math.random() * 10), 100, Math.random() * Math.PI, 1000, { colorTo: randomPastel() }) },
  {
    action: (s) => {
      const blob = Array.from({ length: 18 }, () => [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      ])
      app.morph.to(s, blob, 1300, { colorTo: randomPastel() })
    }
  }
]

const triggerRandomMorph = () => {
  const preset = morphPresets[Math.floor(Math.random() * morphPresets.length)]
  preset.action(morphingShape)
}

const startAutoDance = () => {
  const go = () => {
    triggerRandomMorph()
    setTimeout(go, 1400 + Math.random() * 1600)
  }
  go()
}

onMounted(() => {
  const canvas = document.getElementById('morph-canvas')

  // Full viewport size
  const resize = () => {
    canvas.width = 800 // window.innerWidth
    canvas.height = 600 // window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  app = createCanvasApp(canvas)
  app.use(shapesPlugin)
  app.use(morphPlugin)

  // Dark cosmic background
  app.shapes.rect(0, 0, canvas.width, canvas.height, '#0d001a')

  // Title
  app.shapes.text(
    'morphPlugin.vue',
    canvas.width / 2,
    100,
    'bold 56px "Courier New", monospace',
    '#ffffff',
    { align: 'center', baseline: 'middle' }
  )

  app.shapes.text(
    'click anywhere • watch it breathe',
    canvas.width / 2,
    160,
    '24px "Arial", sans-serif',
    '#888888',
    { align: 'center', baseline: 'top' }
  )

  // The living shape
  morphingShape = app.shapes.polygon(
    canvas.width / 2,
    canvas.height / 2,
    10,
    '#ff1e56',
    { radius: 110 }
  )
  morphingShape.opacity = 0.92

  // Interaction
  canvas.addEventListener('pointerdown', triggerRandomMorph)

  // Auto-morph forever
  startAutoDance()
})

onUnmounted(() => {
  window.removeEventListener('resize', () => { })
  if (app) app.stop()
})
</script>

<template>
  <div class="container">
    <canvas id="morph-canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, #1a0033, #000000);
  font-family: system-ui, -apple-system, sans-serif;
}

#morph-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  /* sharp retro look (optional) */
  cursor: pointer;
}

/* Subtle glow on hover because why not */
#morph-canvas:hover {
  filter: brightness(1.05);
}
</style>
