<template>
  <h1>SVG.js + Shapes Plugin Demo in Vue 3</h1>
  <p>Check the console or inspect the DOM to see the created SVG.</p>

  <div ref="container" style="border: 1px solid #ccc; width: 600px; height: 400px; margin: 20px 0;"></div>

  <button @click="drawScene">Draw Scene</button>
  <button @click="clearScene">Clear</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SVG } from '../../lib/scalable_vector/svg_util.js' 
import { shapesPlugin } from '../../lib/scalable_vector/shapesPlugin.js' 

const svgRoot = SVG.use(shapesPlugin);
const container = ref(null)

const drawScene = () => {
  if (!container.value) return

  // Clear previous content
  container.value.innerHTML = ''

  


  const svg = svgRoot.create({ width: 600, height: 400, viewBox: '0 0 600 400' })
    .attr({ style: 'background: #f0f0f0' })



  container.value.appendChild(svg.el)

  // Now use the shapes plugin (smart & chainable!)
  svg
    .rect(50, 50, 200, 100)
    .attr({ fill: '#3498db', stroke: '#2980b9', 'stroke-width': 4 })

    .circle(400, 100, 60)
    .attr({ fill: '#e74c3c' })

    .line(50, 200, 550, 200)
    .attr({ stroke: '#2ecc71', 'stroke-width': 8 })

    .text('Hello Vue + SVG!', 300, 300)
    .attr({ 'font-size': 32, fill: '#9b59b6', 'text-anchor': 'middle' })

    // Group example
    .g({ transform: 'translate(300,100)' })
      .path('M -50,-30 L 50,-30 L 0,50 Z')
      .attr({ fill: '#f1c40f' })
}

const clearScene = () => {
  if (container.value) container.value.innerHTML = ''
}

// Optional: draw on mount
onMounted(() => {
  drawScene()
})
</script>

<style>
button {
  padding: 10px 20px;
  margin-right: 10px;
  font-size: 16px;
}
</style>
