<script setup>
import { onMounted, ref } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'
import { xyGridAxesPlugin } from '../../lib/engine/xyGridAxesPlugin.js'
import { twoDimensionGridPlugin } from '../../lib/engine/twoDimensionGridPlugin.js'

const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const app = createCanvasApp(canvas)
  app.use(mathPlugin) // activates app.vec2, app.math.TAU, etc.
  app.use(xyGridAxesPlugin)

  app.use(twoDimensionGridPlugin, {
    step: 30,
    color: '#ff0000',
    alpha: 0.25,
    subdivisions: 2,
    axes: true,
    axisColor: '#ff00ff'
  });


  const center = app.vec2(300, 300)
  const r = 120
  const offset = 90

  // app.root.add({
  //   draw(ctx) {
  //     ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   }
  // })

  // Left circle (A) — red
  app.root.add({
    draw(ctx) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.4)'
      ctx.strokeStyle = '#c00'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(center.x - offset, center.y, r, 0, app.math.TAU)
      ctx.fill()
      ctx.stroke()
    }
  })

  // Right circle (B) — blue
  app.root.add({
    draw(ctx) {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.4)'
      ctx.strokeStyle = '#0066ff'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(center.x + offset, center.y, r, 0, app.math.TAU)
      ctx.fill()
      ctx.stroke()
    }
  })

  // Text: Only A
  app.root.add({
    x: center.x - offset,
    y: center.y - 20,
    draw(ctx) {
      ctx.font = 'bold 28px sans-serif'
      ctx.fillStyle = '#800'
      ctx.textAlign = 'center'
      ctx.fillText('Only A', 0, 0)
    }
  })

  // Text: Only B
  app.root.add({
    x: center.x + offset,
    y: center.y - 20,
    draw(ctx) {
      ctx.font = 'bold 28px sans-serif'
      ctx.fillStyle = '#006'
      ctx.textAlign = 'center'
      ctx.fillText('Only B', 0, 0)
    }
  })

  // Text: Intersection
  app.root.add({
    x: center.x,
    y: center.y,
    draw(ctx) {
      ctx.font = 'bold 32px sans-serif'
      ctx.fillStyle = '#333'
      ctx.textAlign = 'center'
      ctx.fillText('A ∩ B', 0, 0)
    }
  })

  // Optional title
  app.root.add({
    x: 300,
    y: 80,
    draw(ctx) {
      ctx.font = '36px sans-serif'
      ctx.fillStyle = '#222'
      ctx.textAlign = 'center'
      ctx.fillText('Venn Diagram', 0, 0)
    }
  })
})
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="600" height="600" class="border border-gray-300 bg-white" />
  </div>
</template>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}
</style>
