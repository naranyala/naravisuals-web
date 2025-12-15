<template>
  <h1>SVG.js + Motion (Motion One) Demo in Vue 3</h1>
  <p>Powerful SVG creation + modern WAAPI/spring animations</p>

  <div ref="container" class="canvas"></div>

  <div class="controls">
    <button @click="startAnimations">Start Animations</button>
    <button @click="resetScene">Reset</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SVG } from '@svgdotjs/svg.js'
import { animate, stagger } from 'motion'

const container = ref(null)
let draw = null // root SVG.js instance
let elements = {} // store references for animation

const createScene = () => {
  if (!container.value) return

  // Clear
  container.value.innerHTML = ''

  // Create SVG with SVG.js
  draw = SVG()
    .addTo(container.value)
    .size(600, 400)
    .viewbox(0, 0, 600, 400)
    .attr({ style: 'background: #f8f9fa' })

  // Shapes we'll animate
  elements.rect = draw
    .rect(100, 100)
    .attr({ x: 50, y: 50, fill: '#3498db', rx: 10 })

  elements.circle = draw
    .circle(80)
    .attr({ cx: 400, cy: 100, fill: '#e74c3c' })

  elements.path = draw
    .path('M50,250 Q300,100 550,250')
    .fill('none')
    .stroke({ width: 8, color: '#2ecc71' })

  elements.text = draw
    .text('SVG.js × Motion')
    .font({ size: 40, family: 'Arial', anchor: 'middle', fill: '#9b59b6' })
    .move(300, 300)

  // Bonus: a group with polygon (triangle)
  const group = draw.group()
  elements.triangle = group
    .polygon('0,0 100,0 50,100')
    .fill('#f1c40f')
    .move(250, 150)
}

const startAnimations = () => {
  // Animate with Motion's powerful animate() – springs, sequences, staggering
  animate(
    [elements.rect.node, elements.circle.node, elements.triangle.node],
    { x: [0, 200, -100], y: [0, -50, 100], rotate: [0, 360] },
    {
      duration: 2,
      easing: 'ease-in-out',
      repeat: Infinity,
      direction: 'alternate',
      delay: stagger(0.3)
    }
  )

  // Line drawing effect (pathLength is a Motion special property)
  animate(
    elements.path.node,
    { pathLength: [0, 1], pathOffset: [1, 0] },
    { duration: 3, easing: 'linear', repeat: Infinity }
  )

  // Spring-based text bounce
  animate(
    elements.text.node,
    { y: [300, 260] },
    { type: 'spring', stiffness: 300, damping: 20, repeat: Infinity, direction: 'alternate' }
  )
}

const resetScene = () => {
  createScene()
}

onMounted(() => {
  createScene()
})
</script>

<style scoped>
.canvas {
  width: 600px;
  height: 400px;
  margin: 20px auto;
  border: 1px solid #ddd;
  overflow: hidden;
}

.controls {
  text-align: center;
}

button {
  padding: 10px 20px;
  margin: 0 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>
