<!-- DragCanvasDemo.vue -->
<template>
  <div class="demo">
    <h2>Drag the shapes around</h2>
    <canvas ref="canvas" width="600" height="400"></canvas>
    <br />
    <button @click="addRandom">Add random circle</button>
  </div>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/* 1.  Import the three plain-JS modules (keep them in /public or /src) */
/* ------------------------------------------------------------------ */
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { dragAndDropPlugin } from '../../lib/engine/dragAndDropPlugin.js'

/* ------------------------------------------------------------------ */
/* 2.  Vue boiler-plate                                                */
/* ------------------------------------------------------------------ */
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)   // template ref
let app = null             // will hold the canvas-app instance

/* ------------------------------------------------------------------ */
/* 3.  Start the engine once the <canvas> exists                      */
/* ------------------------------------------------------------------ */
onMounted(() => {
  app = createCanvasApp(canvas.value)

  // plug-ins
  app.use(shapesPlugin)
  app.use(dragAndDropPlugin)

  // helper to keep things inside the canvas
  const bounds = { minX: 20, maxX: 580, minY: 20, maxY: 380 }

  // ---- create a few demo shapes ------------------------------------
  const c1 = app.shapes.circle(120, 120, 35, '#ff6384')
  c1.makeDraggable({ bounds })

  const r1 = app.shapes.rect(250, 150, 80, 50, '#36a2eb')
  r1.makeDraggable({ bounds })

  const p1 = app.shapes.polygon(420, 200, 6, '#4bc0c0', { radius: 40 })
  p1.makeDraggable({ bounds })
})

/* ------------------------------------------------------------------ */
/* 4.  Optional: add more shapes at runtime                            */
/* ------------------------------------------------------------------ */
function addRandom() {
  const colors = ['#ff6384', '#36a2eb', '#4bc0c0', '#ffcd56', '#9966ff']
  const c = app.shapes.circle(
    Math.random() * 500 + 50,
    Math.random() * 300 + 50,
    Math.random() * 20 + 15,
    colors[Math.floor(Math.random() * colors.length)]
  )
  c.makeDraggable({
    bounds: { minX: 20, maxX: 580, minY: 20, maxY: 380 }
  })
}

/* ------------------------------------------------------------------ */
/* 5.  Clean up when the component unmounts                            */
/* ------------------------------------------------------------------ */
onUnmounted(() => {
  app?.stop()
})
</script>

<style scoped>
.demo {
  text-align: center;
  font-family: sans-serif;
}

canvas {
  border: 1px solid #ccc;
  display: block;
  margin: 0 auto;
}

button {
  margin-top: 8px;
}
</style>
