<template>
  <canvas ref="canvas" width="600" height="400"></canvas>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Vec3, Mat4 } from '../../utilities/linalg.js'   // import your library

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')

  // Cube vertices
  const vertices = [
    new Vec3(-1, -1, -1),
    new Vec3( 1, -1, -1),
    new Vec3( 1,  1, -1),
    new Vec3(-1,  1, -1),
    new Vec3(-1, -1,  1),
    new Vec3( 1, -1,  1),
    new Vec3( 1,  1,  1),
    new Vec3(-1,  1,  1),
  ]

  // Cube edges (pairs of vertex indices)
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ]

  let angle = 0

  function draw() {
    ctx.clearRect(
      0, 
      0, 
      canvas?.value?.width ?? 800, 
      canvas?.value?.height ?? 600
    )

    // Build transformation matrix
    const aspect = canvas.value.width / canvas.value.height
    const proj = Mat4.perspective(Math.PI/3, aspect, 0.1, 100)
    const view = Mat4.lookAt(new Vec3(3,3,3), Vec3.zero(), new Vec3(0,1,0))
    const rotY = Mat4.rotateY(angle)
    const rotX = Mat4.rotateX(angle * 0.5)
    const model = rotY.mul(rotX)
    const mvp = proj.mul(view).mul(model)

    // Project vertices
    const projected = vertices.map(v => {
      const p = mvp.mulVec3(v)
      // perspective divide
      const x = (p.x / p.z) * canvas.value.width/2 + canvas.value.width/2
      const y = (p.y / p.z) * canvas.value.height/2 + canvas.value.height/2
      return {x,y}
    })

    // Draw edges
    // ctx.strokeStyle = 'black'
    ctx.strokeStyle = 'white'

    ctx.beginPath()
    for (const [i,j] of edges) {
      ctx.moveTo(projected[i].x, projected[i].y)
      ctx.lineTo(projected[j].x, projected[j].y)
    }
    ctx.stroke()

    angle += 0.01
    requestAnimationFrame(draw)
  }

  draw()
})
</script>

