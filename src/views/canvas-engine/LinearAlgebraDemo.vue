<template>
  <div class="canvas-container">
    <canvas ref="canvasRef" width="800" height="600"
      style="border: 2px solid #34495e; background: #ecf0f1; border-radius: 8px;">
    </canvas>
  </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue';
// // import { createCanvasApp } from './canvas_util.js';
// import { linearAlgebraPlugin } from './linearAlgebraPlugin.js';

import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { linearAlgebraPlugin } from '../../lib/engine/linearAlgebraPlugin.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js';

// The ref is used to link the canvas DOM element to the script logic
const canvasRef = ref(null);

onMounted(() => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const app = createCanvasApp(canvas);

  // 1. Load Plugins
  app.use(linearAlgebraPlugin);
  app.use(shapesPlugin);
  // Removed: app.use(colorPalettePlugin);

  // Destructure necessary 3D math classes/functions from the linear algebra plugin
  const { Vector3, Matrix4, Mat4 } = app.linalg;

  // --- CUBE DEFINITION ---
  const size = 100; // Half-width/height/depth
  // 8 Vertices of a cube centered at (0, 0, 0)
  const vertices = [
    new Vector3(-size, -size, -size),
    new Vector3(size, -size, -size),
    new Vector3(size, size, -size),
    new Vector3(-size, size, -size),
    new Vector3(-size, -size, size),
    new Vector3(size, -size, size),
    new Vector3(size, size, size),
    new Vector3(-size, size, size)
  ];

  // 12 Edges (pairs of vertex indices)
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  // --- CUBE OBJECT ---
  const cube = app.root.add({
    x: canvas.width / 2,
    y: canvas.height / 2,
    rotX: 0,
    rotY: 0,
    speedX: 0.0005,
    speedY: 0.001,

    update(dt) {
      // Rotate the cube based on delta time (dt) in the main loop
      this.rotX += this.speedX * dt;
      this.rotY += this.speedY * dt;
    },

    draw(ctx) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Projection Matrix (Perspective/Depth)
      const projMat = Matrix4.perspective(
        60, // FOV 60 degrees
        canvas.width / canvas.height,
        1, // Near plane
        2000 // Far plane
      );

      // 2. View Matrix (Camera/Eye position)
      const viewMat = Matrix4.lookAt(
        new Vector3(0, 0, 400),
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0)
      );

      // 3. Model Matrix (Object rotation)
      let modelMat = Mat4.identity(); // Start with an identity matrix
      modelMat.rotateX(this.rotX);    // Apply X rotation
      modelMat.rotateY(this.rotY);    // Apply Y rotation

      // 4. Combine MVP = P * V * M
      let mvpMat = viewMat.multiply(modelMat).multiply(projMat);

      // 5. Project vertices and draw lines
      ctx.beginPath();
      // Hardcoded color since colorPalettePlugin was removed
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 3;

      const projected = vertices.map(v => Mat4.transformVector3(v, mvpMat));

      edges.forEach(([i, j]) => {
        const v1 = projected[i];
        const v2 = projected[j];

        // Map normalized coordinates (-1 to 1) to canvas screen space (0 to width/height)
        const x1 = v1.x + centerX;
        const y1 = v1.y + centerY;
        const x2 = v2.x + centerX;
        const y2 = v2.y + centerY;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
      ctx.stroke();
    }
  });

  // Add a text label
  app.shapes.text(
    '3D Cube Demo with Canvas and Vue',
    canvas.width / 2,
    50,
    '28px sans-serif',
    '#2c3e50',
    { align: 'center', baseline: 'middle' }
  );
});
</script>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
