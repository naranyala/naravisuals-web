<template>
  <div>
    <canvas ref="canvasEl" width="800" height="600"></canvas>
    <div class="controls">
      <button @click="startComplexAnimation">Start Complex Animation</button>
      <button @click="stopAllAnimations">Stop All</button>
      <button @click="resetAnimation">Reset</button>
      <div class="status">
        Active: {{ activeAnimations }} transitions
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

const canvasEl = ref(null)
const activeAnimations = ref(0)
let app = null
let currentTimeline = null
const sceneObjects = ref({})

onMounted(() => {
  app = createCanvasApp(canvasEl.value)
  app.use(transitionPlugin)
  setupComplexScene()
})

onUnmounted(() => {
  stopAllAnimations()
  if (app) app.stop()
})

// ==========================================
// FIXED COMPLEX SCENE SETUP
// ==========================================
function setupComplexScene() {
  // Create objects with proper draw methods
  sceneObjects.value.box1 = app.root.add({
    ...app.createRect(100, 150, 80, 80, '#ff6b6b'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    }
  })

  sceneObjects.value.box2 = app.root.add({
    ...app.createRect(700, 150, 80, 80, '#4ecdc4'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    }
  })

  sceneObjects.value.box3 = app.root.add({
    ...app.createRect(400, 500, 80, 80, '#45b7d1'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    }
  })

  sceneObjects.value.title = app.root.add(app.createText(400, 50, 'Vue Canvas Animations', {
    color: '#2c3e50',
    font: '28px Arial',
    align: 'center',
    baseline: 'middle'
  }))
}

// ==========================================
// FIXED TIMELINE ANIMATION
// ==========================================
function startComplexAnimation() {
  stopAllAnimations()
  resetComplexScene()

  const { box1, box2, box3, title } = sceneObjects.value

  currentTimeline = app.timeline()
  activeAnimations.value++

  currentTimeline
    .add(0, () => {
      safeTimelineTransition(app.transition.presets.fadeIn(title, 500))
    })
    .add(200, () => {
      safeTimelineTransition(app.transition.presets.scaleIn(box1, 800))
    })
    .add(400, () => {
      safeTimelineTransition(app.transition.presets.scaleIn(box2, 800))
    })
    .add(600, () => {
      safeTimelineTransition(app.transition.presets.scaleIn(box3, 800))
    })
    .add(1000, () => {
      // Synchronized movement with color preservation
      Promise.all([
        safeTimelineTransition(app.transition(box1, 600).to({ x: 300, y: 300 }).play()),
        safeTimelineTransition(app.transition(box2, 600).to({ x: 500, y: 300 }).play())
      ])
    })
    .add(1800, () => {
      if (app.transition.camera) {
        app.transition.camera.shake(15, 400)
      }
    })
    .add(2000, () => {
      // Color transitions
      Promise.all([
        safeTimelineTransition(colorTransition(box1, '#ffe66d', 800)),
        safeTimelineTransition(colorTransition(box2, '#95e1d3', 800)),
        safeTimelineTransition(colorTransition(box3, '#f38181', 800))
      ])
    })
    .add(3000, () => {
      // Rotate and scale
      Promise.all([
        safeTimelineTransition(app.transition(box1, 1000).to({
          rotation: Math.PI * 2,
          scaleX: 1.2,
          scaleY: 1.2
        }).play()),
        safeTimelineTransition(app.transition(box2, 1000).to({
          rotation: -Math.PI * 2,
          scaleX: 1.2,
          scaleY: 1.2
        }).play())
      ])
    })
    .add(4200, () => {
      if (app.transition.camera) {
        app.transition.camera.flash('#ffffff', 300, 0.6)
      }
    })
    .add(4500, () => {
      // Final arrangement
      Promise.all([
        safeTimelineTransition(app.transition(box1, 700).to({
          x: 200, y: 400, rotation: 0, scaleX: 1, scaleY: 1
        }).play()),
        safeTimelineTransition(app.transition(box2, 700).to({
          x: 400, y: 400, rotation: 0, scaleX: 1, scaleY: 1
        }).play()),
        safeTimelineTransition(app.transition(box3, 700).to({
          x: 600, y: 400, rotation: 0, scaleX: 1, scaleY: 1
        }).play())
      ])
    })
    .add(5500, () => {
      activeAnimations.value--
    })

  currentTimeline.play().finally(() => {
    if (activeAnimations.value > 0) activeAnimations.value--
  })
}

// ==========================================
// FIXED COLOR TRANSITION (same as demo 1)
// ==========================================
function colorTransition(obj, targetColor, duration = 400) {
  return new Promise((resolve) => {
    const startColor = obj.color || '#000000'
    const startTime = performance.now()

    const updateColor = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(1, elapsed / duration)

      if (progress < 1) {
        obj.color = app.colors.lerpColor(startColor, targetColor, progress)
        requestAnimationFrame(updateColor)
      } else {
        obj.color = targetColor
        resolve()
      }
    }

    updateColor()
  })
}

// ==========================================
// SAFE TIMELINE TRANSITION
// ==========================================
function safeTimelineTransition(transitionPromise) {
  activeAnimations.value++
  return transitionPromise.finally(() => {
    activeAnimations.value = Math.max(0, activeAnimations.value - 1)
  })
}

function stopAllAnimations() {
  if (currentTimeline) {
    currentTimeline.stop()
    currentTimeline = null
  }
  activeAnimations.value = 0
}

function resetAnimation() {
  stopAllAnimations()
  resetComplexScene()
}

function resetComplexScene() {
  const { box1, box2, box3, title } = sceneObjects.value

  if (box1) {
    box1.x = 100; box1.y = 150; box1.scaleX = 1; box1.scaleY = 1;
    box1.rotation = 0; box1.opacity = 1; box1.visible = true; box1.color = '#ff6b6b'
  }

  if (box2) {
    box2.x = 700; box2.y = 150; box2.scaleX = 1; box2.scaleY = 1;
    box2.rotation = 0; box2.opacity = 1; box2.visible = true; box2.color = '#4ecdc4'
  }

  if (box3) {
    box3.x = 400; box3.y = 500; box3.scaleX = 1; box3.scaleY = 1;
    box3.rotation = 0; box3.opacity = 1; box3.visible = true; box3.color = '#45b7d1'
  }

  if (title) {
    title.x = 400; title.y = 50; title.opacity = 1; title.visible = true
  }
}
</script>

<style scoped>
.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #2980b9;
}

.status {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  font-family: monospace;
}
</style>
