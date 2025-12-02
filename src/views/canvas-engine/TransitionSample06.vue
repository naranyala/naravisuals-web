<template>
  <div class="elegant-container">
    <canvas ref="canvasEl" width="800" height="600" class="elegant-canvas"></canvas>
    <div class="elegant-controls">
      <button @click="toggleAnimation" class="elegant-button">
        {{ isPlay ? "STOP" : "ANIMATE" }}
      </button>
      <!-- <button @click="createFloatingElement" class="elegant-button"> -->
      <!--   Add Element -->
      <!-- </button> -->
      <!-- <button @click="resetElegantScene" class="elegant-button"> -->
      <!--   Reset -->
      <!-- </button> -->
    </div>
    <div class="inspiration-text">
      "Simplicity is the ultimate sophistication"
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

const canvasEl = ref(null)
let app = null
const elegantObjects = ref({})
const floatingElements = ref([])

onMounted(() => {
  app = createCanvasApp(canvasEl.value)
  app.use(transitionPlugin)
  setupElegantScene()

})

const isPlay = ref(false)
let anim = { elFlow: null, elMove: null }

function toggleAnimation() {
  // console.log(anim)
  // if (!anim.elFlow) {
  // anim.elFlow = setInterval(() => startElegantFlow(), 1200)

  for (let i = 0; i < 20; i++) startElegantFlow();
  // isPlay.value = true;
  // } else {
  // clearInterval(anim.elFlow)
  // isPlay.value = false;
  // }

  // if (!anim.elMove) {
  // anim.elMove = setInterval(() => createFloatingElement(), 100)

  for (let i = 0; i < 200; i++) startElegantFlow();
  // } else {
  //   clearInterval(anim.elMove)
  // }

  console.log(anim)
}

onUnmounted(() => {
  stopAllAnimations()
  if (app) app.stop()
})

// ==========================================
// ELEGANT SCENE SETUP
// ==========================================
function setupElegantScene() {
  // Background elements
  elegantObjects.value.background = app.root.add({
    draw(ctx) {
      // Subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600)
      gradient.addColorStop(0, '#f8f9fa')
      gradient.addColorStop(1, '#e9ecef')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 600)
    }
  })

  // Central focal element
  elegantObjects.value.centerPiece = app.root.add({
    ...app.createCircle(400, 300, 80, '#6c5ce7'),
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()

      // Subtle inner circle
      ctx.fillStyle = '#ffffff44'
      ctx.beginPath()
      ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // Orbiting elements
  const orbitColors = ['#00b894', '#e17055', '#0984e3', '#fdcb6e']
  elegantObjects.value.orbiters = orbitColors.map((color, i) => {
    const angle = (i / orbitColors.length) * Math.PI * 2
    const distance = 150
    return app.root.add({
      ...app.createCircle(
        400 + Math.cos(angle) * distance,
        300 + Math.sin(angle) * distance,
        25, color
      ),
      originalAngle: angle,
      draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.fill()

        // Soft shadow
        ctx.fillStyle = this.color + '44'
        ctx.beginPath()
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  })

  // Elegant typography
  elegantObjects.value.title = app.root.add(app.createText(400, 500, 'Motion Design', {
    color: '#2d3436',
    font: '32px "Helvetica Neue", Arial, sans-serif',
    align: 'center',
    baseline: 'middle'
  }))
}

// ==========================================
// ELEGANT ANIMATION FLOW
// ==========================================
async function startElegantFlow() {
  resetElegantScene()

  try {
    // 1. Gentle center piece emergence
    await app.transition(elegantObjects.value.centerPiece, 1200, 'easeOutCubic')
      .from({ scaleX: 0, scaleY: 0, opacity: 0 })
      .to({ scaleX: 1, scaleY: 1, opacity: 1 })
      .play()

    // 2. Sequential orbiter entrance with stagger
    for (let i = 0; i < elegantObjects.value.orbiters.length; i++) {
      const orbiter = elegantObjects.value.orbiters[i]
      await app.transition(orbiter, 800, 'easeOutBack')
        .from({
          scaleX: 0,
          scaleY: 0,
          opacity: 0,
          x: 400,
          y: 300
        })
        .play()

      await app.delay(150)
    }

    // 3. Start orbital motion
    startOrbitalMotion()

    // 4. Title fade in
    await app.transition(elegantObjects.value.title, 1000, 'easeInOut')
      .from({ opacity: 0, y: 550 })
      .to({ opacity: 1, y: 500 })
      .play()

    // 5. Color morphing sequence
    await colorMorphSequence()

    // 6. Gentle floating elements
    startFloatingElements()

  } catch (error) {
    console.log('Elegant flow interrupted:', error)
  }
}

// ==========================================
// ELEGANT EFFECTS
// ==========================================
function startOrbitalMotion() {
  let time = 0

  const orbitUpdate = {
    update(dt) {
      time += dt / 1000

      elegantObjects.value.orbiters.forEach((orbiter, i) => {
        const angle = orbiter.originalAngle + time * 0.5
        const distance = 150 + Math.sin(time * 2 + i) * 20

        orbiter.x = 400 + Math.cos(angle) * distance
        orbiter.y = 300 + Math.sin(angle) * distance

        // Subtle scale pulsing
        orbiter.scaleX = 1 + Math.sin(time * 3 + i) * 0.1
        orbiter.scaleY = 1 + Math.sin(time * 3 + i) * 0.1
      })
    }
  }

  app.root.add(orbitUpdate)
  floatingElements.value.push(orbitUpdate)
}

async function colorMorphSequence() {
  const colors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e']

  for (const color of colors) {
    await Promise.all([
      app.transition(elegantObjects.value.centerPiece, 1600, 'easeInOut')
        .to({ color })
        .play(),
      ...elegantObjects.value.orbiters.map((orbiter, i) =>
        app.delay(i * 200).then(() =>
          app.transition(orbiter, 1200, 'easeInOut')
            .to({ color })
            .play()
        )
      )
    ])

    await app.delay(800)
  }
}

function createFloatingElement() {
  const shapes = ['circle', 'square', 'triangle']
  const shape = shapes[app.randomInt(0, shapes.length - 1)]
  const color = `hsl(${app.randomInt(0, 360)}, 70%, 60%)`

  const element = app.root.add({
    x: app.randomInt(100, 700),
    y: 650,
    scaleX: 0,
    scaleY: 0,
    rotation: 0,
    color: color,
    shape: shape,
    velocity: app.randomRange(-0.5, 0.5),
    life: 300,

    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.life / 300

      if (this.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, 15, 0, Math.PI * 2)
        ctx.fill()
      } else if (this.shape === 'square') {
        ctx.fillRect(-12, -12, 24, 24)
      } else if (this.shape === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(0, -10)
        ctx.lineTo(8.66, 5)
        ctx.lineTo(-8.66, 5)
        ctx.closePath()
        ctx.fill()
      }
    },

    update() {
      this.y -= 2
      this.x += this.velocity
      this.rotation += 0.02
      this.life--

      if (this.life <= 0 || this.y < -50) {
        app.root.remove(this)
        floatingElements.value = floatingElements.value.filter(e => e !== this)
      }
    }
  })

  // Gentle entrance
  app.transition(element, 600, 'easeOutBack')
    .to({ scaleX: 1, scaleY: 1 })
    .play()

  floatingElements.value.push(element)
}

function startFloatingElements() {
  const interval = setInterval(() => {
    if (floatingElements.value.length < 8) {
      createFloatingElement()
    }
  }, 1200)

  floatingElements.value.push(interval)
}

function resetElegantScene() {
  stopAllAnimations()

  // Clear floating elements
  floatingElements.value.forEach(element => {
    if (typeof element === 'object' && element.update) {
      app.root.remove(element)
    } else if (typeof element === 'number') {
      clearInterval(element)
    }
  })
  floatingElements.value = []

  // Reset main objects
  if (elegantObjects.value.centerPiece) {
    elegantObjects.value.centerPiece.scaleX = 1
    elegantObjects.value.centerPiece.scaleY = 1
    elegantObjects.value.centerPiece.opacity = 1
    elegantObjects.value.centerPiece.color = '#6c5ce7'
  }

  elegantObjects.value.orbiters.forEach((orbiter, i) => {
    const angle = (i / elegantObjects.value.orbiters.length) * Math.PI * 2
    const distance = 150
    orbiter.x = 400 + Math.cos(angle) * distance
    orbiter.y = 300 + Math.sin(angle) * distance
    orbiter.scaleX = 1
    orbiter.scaleY = 1
    orbiter.opacity = 1
  })

  if (elegantObjects.value.title) {
    elegantObjects.value.title.opacity = 1
    elegantObjects.value.title.y = 500
  }
}

function stopAllAnimations() {
  // Clean up any running animations
}
</script>

<style scoped>
.elegant-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.elegant-canvas {
  background: white;
  border-radius: 15px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.elegant-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 30px 0 20px 0;
}

.elegant-button {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.elegant-button:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.inspiration-text {
  text-align: center;
  color: white;
  font-style: italic;
  font-size: 16px;
  margin-top: 15px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
