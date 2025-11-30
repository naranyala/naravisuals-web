<!-- CanvasDemo.vue -->
<template>
  <div class="wrapper">
    <canvas ref="canvas" width="600" height="400"></canvas>
  </div>
</template>

<script setup>
/* -------------------------------------------------
   0.  Imports
-------------------------------------------------- */
import { ref, onMounted, onUnmounted } from 'vue'

import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { textPlugin } from '../../lib/engine/textPlugin.js'

/* -------------------------------------------------
   1.  Canvas ref & lifecycle
-------------------------------------------------- */
const canvas = ref(null)
let app = null

onMounted(() => {
  /* 1.1  create engine */
  app = createCanvasApp(canvas.value)

  /* 1.2  plug-ins */
  app.use(textPlugin)

  /* 1.3  build scene */
  buildScene(app)
})

onUnmounted(() => {
  app?.stop() // kill RAF loop
})

/* -------------------------------------------------
   2.  Demo scene
-------------------------------------------------- */
function buildScene(app) {
  const { text, animateTo, ease } = app

  // (A) Gradient title
  const title = text.gradient(300, 120, 'Vue ❤ Canvas', {
    size: 48,
    gradient: ['#42b883', '#35495e'],
    direction: 'to right'
  })
  title.opacity = 0
  animateTo(title, 'opacity', 1, 1200, ease)

  // (B) Stroked subtitle that slides up
  const sub = text.stroke(300, 200, 'with canvas_util.js', {
    size: 28,
    color: '#fff',
    strokeColor: '#000',
    strokeWidth: 3
  })
  sub.y += 30
  sub.opacity = 0
  animateTo(sub, 'y', 200, 900, ease)
  animateTo(sub, 'opacity', 1, 900, ease)

  // (C) Typewriter line
  text.typewriter(300, 270, 'npm create vite@latest —— easy!', {
    size: 22,
    speed: 60,
    cursorBlink: 400
  })

  // (D) Pointer-tracked multiline block
  const info = text.multiline(0, 0, 'Move your pointer around. The engine runs inside Vue script-setup with zero config.', {
    size: 18,
    maxWidth: 260,
    align: 'center',
    color: '#eee'
  })
  info.opacity = 0.8

  // simple follow behaviour
  app.start(function* () {
    while (true) {
      info.x = app.pointer.x
      info.y = app.pointer.y + 30
      yield 16
    }
  }, 'follow')
}
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #111;
}

canvas {
  border: 1px solid #333;
  border-radius: 8px;
}
</style>
