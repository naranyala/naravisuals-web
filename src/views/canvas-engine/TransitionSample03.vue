<template>
  <div>
    <canvas ref="canvasEl" width="800" height="600" style="border: 1px solid #ccc;"></canvas>
    <div style="margin-top: 20px;">
      <button @click="startAnimation">Start Animation</button>
      <button @click="resetAnimation">Reset</button>
      <button @click="createParticleBurst(400, 300)">Particles</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { tweenPlugin } from '../../lib/engine/tweenPlugin.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

const canvasEl = ref(null)
let app = null
const objects = ref({})
let activeTransitions = new Set()

onMounted(() => {
  if (!canvasEl.value) return

  app = createCanvasApp(canvasEl.value)

  // orders matter
  app.use(tweenPlugin)
  app.use(transitionPlugin)

  setupScene()
})

onUnmounted(() => {
  stopAllAnimations()
  if (app) app.stop()
})

// ==========================================
// FIXED SCENE SETUP
// ==========================================
function setupScene() {
  // Create objects with proper initialization
  objects.value.square = app.root.add({
    ...app.createRect(400, 300, 100, 100, '#ff4444'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    }
  })

  objects.value.circle = app.root.add({
    ...app.createCircle(200, 200, 50, '#4444ff'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  objects.value.text = app.root.add(app.createText(400, 100, 'Hello Vue!', {
    color: '#333333',
    font: '24px Arial',
    align: 'center',
    baseline: 'middle'
  }))
}

// ==========================================
// FIXED ANIMATION FUNCTIONS
// ==========================================
function startAnimation() {
  if (!app) return

  stopAllAnimations()
  resetObjects()
  runAnimationSequence()
}

function resetAnimation() {
  stopAllAnimations()
  resetObjects()
}

function stopAllAnimations() {
  // Clear all active transitions
  activeTransitions.forEach(transition => {
    if (transition.stop) transition.stop()
  })
  activeTransitions.clear()

  // Stop timeline if exists
  if (app.timeline && app.timeline.count && app.timeline.count() > 0) {
    // You might need to expose timeline stopping mechanism
  }
}

function resetObjects() {
  const { square, circle, text } = objects.value

  if (square) {
    square.x = 400
    square.y = 300
    square.scaleX = 1
    square.scaleY = 1
    square.opacity = 1
    square.visible = true
    square.color = '#ff4444'
  }

  if (circle) {
    circle.x = 200
    circle.y = 200
    circle.opacity = 1
    circle.visible = true
    circle.color = '#4444ff'
  }

  if (text) {
    text.x = 400
    text.y = 100
    text.opacity = 1
    text.visible = true
    text.color = '#333333'
  }
}

// ==========================================
// FIXED ANIMATION SEQUENCE
// ==========================================
async function runAnimationSequence() {
  const { square, circle, text } = objects.value
  if (!square || !circle || !text) return

  try {
    // 1. Fade in the text
    await safeTransition(app.transition.presets.fadeIn(text, 800))

    // 2. Scale in the square with elastic effect
    await safeTransition(app.transition.presets.scaleIn(square, 1000))

    // 3. Slide in the circle from left
    await safeTransition(app.transition.presets.slideIn(circle, 'left', 700))

    // 4. Move square to right with custom transition
    await safeTransition(app.transition(square, 600, 'easeOutBounce')
      .to({ x: 600 })
      .play())

    // 5. Move circle down
    await safeTransition(app.transition(circle, 500, 'easeInOut')
      .to({ y: 400 })
      .play())

    // 6. Change colors simultaneously - FIXED COLOR TRANSITION
    await Promise.all([
      safeTransition(colorTransition(square, '#44ff44', 400)),
      safeTransition(colorTransition(circle, '#ff44ff', 400))
    ])

    // 7. Camera shake effect
    if (app.transition.camera) {
      app.transition.camera.shake(20, 300)
    }

    // 8. Scale both objects
    await Promise.all([
      safeTransition(app.transition(square, 400).to({ scaleX: 1.5, scaleY: 1.5 }).play()),
      safeTransition(app.transition(circle, 400).to({ scaleX: 1.5, scaleY: 1.5 }).play())
    ])

    // 9. Flash effect
    if (app.transition.camera) {
      app.transition.camera.flash('#ffffff', 200)
    }

    // 10. Final fade out
    await Promise.all([
      safeTransition(app.transition.presets.fadeOut(square, 600)),
      safeTransition(app.transition.presets.fadeOut(circle, 600)),
      safeTransition(app.transition.presets.fadeOut(text, 600))
    ])

  } catch (error) {
    console.log('Animation cancelled or error:', error)
  }
}

// ==========================================
// FIXED COLOR TRANSITION HELPER
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
// SAFE TRANSITION WRAPPER
// ==========================================
function safeTransition(transitionPromise) {
  const transition = transitionPromise
  activeTransitions.add(transition)

  return transitionPromise
    .then(result => {
      activeTransitions.delete(transition)
      return result
    })
    .catch(error => {
      activeTransitions.delete(transition)
      throw error
    })
}

// ==========================================
// FIXED PARTICLE SYSTEM
// ==========================================
function createParticleBurst(x, y) {
  if (!app) return

  const emitter = app.createParticleEmitter({
    x,
    y,
    rate: 100,
    lifetime: 1000,
    speed: 200,
    spread: Math.PI * 2,
    size: 4,
    color: app.colors.randomColor(),
    gravity: 300,
    maxParticles: 50
  })

  // Add to scene with proper drawing
  const particleObject = {
    update: emitter.update.bind(emitter),
    draw: emitter.draw.bind(emitter),
    x: 0, y: 0, visible: true
  }

  app.root.add(particleObject)

  // Emit particles once
  emitter.emit(30)

  // Remove emitter after particles are gone
  setTimeout(() => {
    app.root.remove(particleObject)
  }, 1500)
}

// ==========================================
// FIXED CLICK INTERACTION
// ==========================================
function onCanvasClick(event) {
  if (!app || !canvasEl.value) return

  const rect = canvasEl.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  createParticleBurst(x, y)

  if (objects.value.text) {
    safeTransition(app.transition(objects.value.text, 400, 'easeOutBack')
      .to({ x, y })
      .play())
  }
}

onMounted(() => {
  if (canvasEl.value) {
    canvasEl.value.addEventListener('click', onCanvasClick)
  }
})

onUnmounted(() => {
  if (canvasEl.value) {
    canvasEl.value.removeEventListener('click', onCanvasClick)
  }
})
</script>
