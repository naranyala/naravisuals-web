<template>
  <div class="container">
    <div class="star-demo">
      <canvas ref="canvas" :width="width" :height="height" />

      <div class="controls" v-if="showControls">
        <h3>Star Controls</h3>

        <div class="control-group">
          <label>Points: {{ config.points }}</label>
          <input type="range" v-model="config.points" min="3" max="12" step="1">
        </div>

        <div class="control-group">
          <label>Sharpness: {{ makeFixedNum(config.sharpness, 2) }}</label>
          <input type="range" v-model="config.sharpness" min="0" max="1" step="0.01">
        </div>

        <div class="control-group">
          <label>Rotation Speed: {{ makeFixedNum(config.rotationSpeed, 2) }}</label>
          <input type="range" v-model="config.rotationSpeed" min="-3" max="3" step="0.1">
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" v-model="config.wireframe">
            Wireframe Mode
          </label>
        </div>

        <div class="control-group">
          <button @click="resetConfig" class="reset-btn">Reset</button>
        </div>
      </div>

      <button @click="showControls = !showControls" class="toggle-btn">
        {{ showControls ? 'Hide' : 'Show' }} Controls
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'

import { makeFixedNum } from "../../utilities/mathCollection.js"

const canvas = ref(null)
const width = 1000
const height = 500
const showControls = ref(true)

const config = reactive({
  points: 5,
  innerRadius: 40,
  outerRadius: 100,
  sharpness: 0.5,
  rotationSpeed: 0.5,
  wireframe: true,
  fillColor: '#ffd700',
  strokeColor: '#ff9900',
  strokeWidth: 2,
  animate: true
})

let app = null
let star = null
let rotation = 0


const generateStarPoints = (points, innerR, outerR, sharpness) => {
  const pts = []
  const angleStep = (Math.PI * 2) / points
  for (let i = 0; i < points; i++) {
    const outerAngle = i * angleStep
    const innerAngle = outerAngle + angleStep / 2
    const innerRadius = innerR + (outerR - innerR) * (1 - sharpness)

    pts.push([Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR])
    pts.push([Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius])
  }
  return pts
}

const initCanvas = () => {
  app = createCanvasApp(canvas.value)
  app.use(shapesPlugin)

  // Draw grid
  const gridSize = 50
  for (let x = 0; x <= width; x += gridSize) {
    app.shapes.line(x, 0, x, height, 1, 'rgba(255,255,255,0.1)')
  }
  for (let y = 0; y <= height; y += gridSize) {
    app.shapes.line(0, y, width, y, 1, 'rgba(255,255,255,0.1)')
  }

  // Center crosshair
  app.shapes.line(width / 2 - 20, height / 2, width / 2 + 20, height / 2, 1, 'rgba(255,255,255,0.3)')
  app.shapes.line(width / 2, height / 2 - 20, width / 2, height / 2 + 20, 1, 'rgba(255,255,255,0.3)')

  // ✅ Create a star object that respects transforms
  const starPoints = generateStarPoints(config.points, config.innerRadius, config.outerRadius, config.sharpness)

  star = app.root.add({
    x: width / 2,
    y: height / 2,
    rotation: 0,
    points: starPoints,
    fillColor: config.fillColor,
    strokeColor: config.strokeColor,
    strokeWidth: config.strokeWidth,

    draw(ctx) {
      ctx.beginPath()
      ctx.moveTo(this.points[0][0], this.points[0][1])
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i][0], this.points[i][1])
      }
      ctx.closePath()

      if (!config.wireframe) {
        ctx.fillStyle = this.fillColor
        ctx.fill()
      }

      ctx.strokeStyle = this.strokeColor
      ctx.lineWidth = this.strokeWidth
      ctx.stroke()
    }
  })

  // ✅ Animation loop
  app.start(function* () {
    while (true) {
      if (config.animate) {
        rotation += config.rotationSpeed * 0.02
        star.rotation = rotation
      }
      yield 16
    }
  })

  // END
}

const resetConfig = () => {
  Object.assign(config, {
    points: 5,
    innerRadius: 40,
    outerRadius: 100,
    sharpness: 0.5,
    rotationSpeed: 0.5,
    wireframe: true,
    fillColor: '#ffd700',
    strokeColor: '#ff9900',
    strokeWidth: 2,
    animate: true
  })
  rotation = 0
}

watch(config, () => {
  if (!app || !star) return

  // console.log("config: ", config)

  // Update star shape
  star.points = generateStarPoints(config.points, config.innerRadius, config.outerRadius, config.sharpness)
  star.color = config.fillColor
  star.stroke = config.strokeColor
  star.lineWidth = config.strokeWidth
})

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  app?.stop()
})
</script>


<style scoped>
.star-demo {
  position: relative;
  display: inline-block;
}

canvas {
  display: block;
  background: #1a1a2e;
  border: 2px solid #444;
  border-radius: 4px;
  /* max-width: 100%; */
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(30, 30, 40, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #5555ff;
  font-family: monospace;
  width: 250px;
}

.controls h3 {
  margin: 0 0 15px 0;
  text-align: center;
  color: #aaaaff;
}

.control-group {
  margin: 12px 0;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  background: #444466;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  background: #5555ff;
  border-radius: 50%;
  cursor: pointer;
}

input[type="checkbox"] {
  margin-right: 8px;
}

.reset-btn {
  width: 100%;
  padding: 8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
  font-weight: bold;
}

.reset-btn:hover {
  background: #ff5555;
}

.toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #5555ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
}

.toggle-btn:hover {
  background: #6666ff;
}

.container {
  margin: 0 auto;
  display: flex;
  align-content: center;
  text-align: left;
  padding: 0 auto;
}
</style>
