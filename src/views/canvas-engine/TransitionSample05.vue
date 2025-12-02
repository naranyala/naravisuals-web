<template>
  <div class="cyberpunk-container">
    <canvas ref="canvasEl" width="800" height="600" class="cyberpunk-canvas"></canvas>
    <div class="cyberpunk-controls">
      <button @click="startCyberpunkSequence" class="cyber-button">
        <span class="glow-text">INITIATE SEQUENCE</span>
      </button>
      <button @click="createDataStream" class="cyber-button">
        <span class="glow-text">DATA STREAM</span>
      </button>
      <button @click="resetCyberpunk" class="cyber-button">
        <span class="glow-text">RESET SYSTEM</span>
      </button>
    </div>
    <div class="status-display">
      <div class="status-item" :style="{ color: statusColor }">
        SYSTEM: {{ systemStatus }}
      </div>
      <div class="status-item">
        ENERGY: {{ energyLevel }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { transitionPlugin } from '../../lib/engine/transitionPlugin.js'

const canvasEl = ref(null)
let app = null
const cyberObjects = ref({})
const systemStatus = ref('STANDBY')
const energyLevel = ref(0)
const activeGlitches = ref([])

const statusColor = computed(() => {
  switch (systemStatus.value) {
    case 'STANDBY': return '#00ff88'
    case 'ACTIVE': return '#ff0088'
    case 'GLITCH': return '#ff4444'
    default: return '#00ffff'
  }
})

onMounted(() => {
  app = createCanvasApp(canvasEl.value)
  app.use(transitionPlugin)
  setupCyberpunkScene()
})

onUnmounted(() => {
  stopAllAnimations()
  if (app) app.stop()
})

// ==========================================
// CYBERPUNK SCENE SETUP
// ==========================================
function setupCyberpunkScene() {
  // Main terminal display
  cyberObjects.value.terminal = app.root.add({
    ...app.createRect(400, 300, 600, 400, '#001122'),
    draw(ctx) {
      // Main terminal body
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

      // Terminal glow
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 3
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)

      // Grid lines
      ctx.strokeStyle = '#00ff8844'
      ctx.lineWidth = 1
      for (let i = -this.width / 2 + 20; i < this.width / 2; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, -this.height / 2)
        ctx.lineTo(i, this.height / 2)
        ctx.stroke()
      }
      for (let j = -this.height / 2 + 20; j < this.height / 2; j += 40) {
        ctx.beginPath()
        ctx.moveTo(-this.width / 2, j)
        ctx.lineTo(this.width / 2, j)
        ctx.stroke()
      }
    }
  })

  // Central core
  cyberObjects.value.core = app.root.add({
    ...app.createCircle(400, 300, 40, '#ff0088'),
    draw(ctx) {
      // Pulsing core
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()

      // Core glow
      ctx.strokeStyle = '#ff0088'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2)
      ctx.stroke()
    }
  })

  // Satellite nodes
  const nodePositions = [
    { x: 250, y: 200, color: '#00ffff' },
    { x: 550, y: 200, color: '#ff0088' },
    { x: 250, y: 400, color: '#00ff88' },
    { x: 550, y: 400, color: '#ffff00' }
  ]

  cyberObjects.value.nodes = nodePositions.map((pos, i) => {
    return app.root.add({
      ...app.createCircle(pos.x, pos.y, 20, pos.color),
      draw(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.fill()

        // Node connection point
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, 5, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  })

  // Status text
  cyberObjects.value.statusText = app.root.add(app.createText(400, 500, 'SYSTEM READY', {
    color: '#00ff88',
    font: '16px "Courier New", monospace',
    align: 'center',
    baseline: 'middle'
  }))
}

// ==========================================
// CYBERPUNK ANIMATION SEQUENCE
// ==========================================
async function startCyberpunkSequence() {
  systemStatus.value = 'ACTIVE'
  energyLevel.value = 0
  resetCyberpunk()

  try {
    // 1. Boot sequence - terminal glow up
    await app.transition(cyberObjects.value.terminal, 800)
      .to({ color: '#002244' })
      .play()

    // 2. Core activation with pulse
    await app.transition(cyberObjects.value.core, 600)
      .to({ scaleX: 1.5, scaleY: 1.5 })
      .play()

    // Start core pulsing
    startCorePulse()

    // 3. Sequential node activation
    for (let i = 0; i < cyberObjects.value.nodes.length; i++) {
      const node = cyberObjects.value.nodes[i]
      await app.transition(node, 400)
        .to({ scaleX: 1.3, scaleY: 1.3 })
        .play()

      // Create connection line
      createConnection(cyberObjects.value.core, node)
      energyLevel.value += 25

      await app.delay(200)
    }

    // 4. Data storm
    systemStatus.value = 'GLITCH'
    createDataStorm()

    // 5. System stabilization
    await app.delay(2000)
    systemStatus.value = 'ACTIVE'
    stopDataStorm()

    // 6. Final energy surge
    await app.transition({}, 1000)
      .call(() => {
        energyLevel.value = 100
        createEnergySurge()
      })
      .play()

  } catch (error) {
    console.log('Cyberpunk sequence interrupted:', error)
  }
}

// ==========================================
// CYBERPUNK EFFECTS
// ==========================================
function startCorePulse() {
  const core = cyberObjects.value.core
  let pulseDirection = 1

  const pulseInterval = setInterval(() => {
    if (!core) {
      clearInterval(pulseInterval)
      return
    }

    core.scaleX += 0.1 * pulseDirection
    core.scaleY += 0.1 * pulseDirection

    if (core.scaleX >= 1.5) pulseDirection = -1
    if (core.scaleX <= 1.0) pulseDirection = 1

  }, 100)

  // Store for cleanup
  activeGlitches.value.push(pulseInterval)
}

function createConnection(fromObj, toObj) {
  const connection = app.root.add({
    from: fromObj,
    to: toObj,
    life: 100,
    draw(ctx) {
      if (!this.from || !this.to) return

      ctx.strokeStyle = `rgba(0, 255, 136, ${this.life / 100})`
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(this.from.x, this.from.y)
      ctx.lineTo(this.to.x, this.to.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Animated data packet
      const progress = (100 - this.life) / 100
      const packetX = this.from.x + (this.to.x - this.from.x) * progress
      const packetY = this.from.y + (this.to.y - this.from.y) * progress

      ctx.fillStyle = '#00ffff'
      ctx.beginPath()
      ctx.arc(packetX, packetY, 3, 0, Math.PI * 2)
      ctx.fill()
    },
    update() {
      this.life--
      if (this.life <= 0) {
        app.root.remove(this)
      }
    }
  })
}

function createDataStorm() {
  const stormInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      createGlitchParticle(
        app.randomRange(100, 700),
        app.randomRange(100, 500),
        app.colors.randomColor()
      )
    }
  }, 100)

  activeGlitches.value.push(stormInterval)
}

function createGlitchParticle(x, y, color) {
  const particle = app.root.add({
    x, y,
    vx: app.randomRange(-3, 3),
    vy: app.randomRange(-3, 3),
    life: 30,
    color: color,
    draw(ctx) {
      ctx.fillStyle = this.color
      ctx.fillRect(this.x - 2, this.y - 2, 4, 4)

      // Glitch trail
      ctx.strokeStyle = this.color + '88'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5)
      ctx.stroke()
    },
    update() {
      this.x += this.vx
      this.y += this.vy
      this.life--

      if (this.life <= 0) {
        app.root.remove(this)
      }
    }
  })
}

function createDataStream() {
  for (let i = 0; i < 10; i++) {
    app.delay(i * 100).then(() => {
      createConnection(
        cyberObjects.value.nodes[app.randomInt(0, 3)],
        cyberObjects.value.nodes[app.randomInt(0, 3)]
      )
    })
  }
}

function createEnergySurge() {
  const surge = app.root.add({
    radius: 10,
    maxRadius: 200,
    draw(ctx) {
      ctx.strokeStyle = `rgba(0, 255, 136, ${1 - this.radius / this.maxRadius})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(400, 300, this.radius, 0, Math.PI * 2)
      ctx.stroke()
    },
    update() {
      this.radius += 5
      if (this.radius > this.maxRadius) {
        app.root.remove(this)
      }
    }
  })
}

function stopDataStorm() {
  activeGlitches.value.forEach(interval => clearInterval(interval))
  activeGlitches.value = []
}

function resetCyberpunk() {
  stopAllAnimations()
  stopDataStorm()

  systemStatus.value = 'STANDBY'
  energyLevel.value = 0

  // Reset objects
  if (cyberObjects.value.terminal) {
    cyberObjects.value.terminal.color = '#001122'
  }
  if (cyberObjects.value.core) {
    cyberObjects.value.core.scaleX = 1
    cyberObjects.value.core.scaleY = 1
  }

  cyberObjects.value.nodes.forEach(node => {
    node.scaleX = 1
    node.scaleY = 1
  })
}

function stopAllAnimations() {
  // Implementation depends on your transition plugin
}
</script>

<style scoped>
.cyberpunk-container {
  background: #0a0a0a;
  padding: 20px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
}

.cyberpunk-canvas {
  background: #001122;
  border: 2px solid #00ffff;
  border-radius: 5px;
  box-shadow: 0 0 20px #00ffff88;
}

.cyberpunk-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.cyber-button {
  background: transparent;
  border: 1px solid #00ffff;
  padding: 12px 24px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-button:hover {
  background: #00ffff22;
  box-shadow: 0 0 15px #00ffff;
}

.glow-text {
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 10px #00ffff;
}

.status-display {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
}

.status-item {
  padding: 8px 16px;
  background: #001122;
  border: 1px solid #00ff88;
  border-radius: 3px;
  font-size: 14px;
  color: #00ff88;
  text-shadow: 0 0 5px currentColor;
}
</style>
