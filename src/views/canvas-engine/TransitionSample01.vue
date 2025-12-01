<!-- TransitionDemo.vue -->
<template>
  <div class="wrapper">
    <!-- The stage -->
    <canvas ref="stage" width="800" height="450"></canvas>

    <!-- UI -->
    <button @click="runTransition">Run transition</button>
  </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

const stage = ref(null)

let app, circle
onMounted(() => {
  // create the 2-D app
  app = createCanvasApp(stage.value)

  // plug the transition system in
  app.use(transitionPlugin)

  // add a red circle (hidden by default)
  circle = app.root.add(
    app.createCircle(app.canvas.width / 2, app.canvas.height / 2, 60, '#e11')
  )
  circle.visible = false
})

/* -------------------------------------
 * 4.  Button handler → fire transition
 * ------------------------------------- */
function runTransition() {
  if (!app) return

  // reset circle state
  circle.visible = true
  circle.opacity = 1
  circle.scaleX = circle.scaleY = 1

  // cinematic sequence:
  //   scale-in  →  screen-shake  →  fade-out
  app.transition.presets
    .scaleIn(circle, 800)          // <- returns a promise
    .then(() => app.transition.camera.shake(20, 400))
    .then(() => app.transition.presets.fadeOut(circle, 600))
}
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 800px;
  margin: 2rem auto;
}

canvas {
  display: block;
  background: #111;
  border-radius: 8px;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
