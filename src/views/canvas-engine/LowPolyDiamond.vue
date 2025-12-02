<template>
  <div class="diamond-container">
    <canvas ref="canvasRef" width="400" height="400" style="background-color: #111; border-radius: 8px;"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// Assuming the utility files are accessible via standard ES module imports
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { mathPlugin } from '../../lib/engine/mathPlugin.js';
import { meshTopologyPlugin } from '../../lib/engine/meshTopologyPlugin.js';

// 1. Setup Vue Refs
const canvasRef = ref(null);
let app = null;

// 2. Diamond Mesh Definition (5 vertices, 4 faces)
const createDiamondMesh = (app, size = 150) => {
  const { Mesh } = app.mesh;
  const mesh = new Mesh();

  // Define vertices (Indices 0-4)
  const halfWidth = size * 0.45; // Taper the width
  const halfHeight = size * 0.75; // Taller than wide

  // V0: Top, V1: Right, V2: Bottom, V3: Left, V4: Center
  const v0 = mesh.addVertex(0, -halfHeight);
  const v1 = mesh.addVertex(halfWidth, 0);
  const v2 = mesh.addVertex(0, halfHeight);
  const v3 = mesh.addVertex(-halfWidth, 0);
  const v4 = mesh.addVertex(0, 0);

  // Define faces (triangles meeting at the center V4)
  // Use slightly different colors for a faceted, low-poly look
  mesh.addFace(v0, v1, v4, '#6C94FF'); // Top-Right facet
  mesh.addFace(v1, v2, v4, '#3969FF'); // Bottom-Right facet
  mesh.addFace(v2, v3, v4, '#6C94FF'); // Bottom-Left facet
  mesh.addFace(v3, v0, v4, '#3969FF'); // Top-Left facet

  // Center the mesh in 2D space for clean rotation
  mesh.center();

  // Set initial properties for the demo
  mesh.wireframe = true;
  mesh.wireframeColor = '#A0C0FF';
  mesh.wireframeWidth = 1.5;
  mesh.x = 200; // Move to canvas center (400/2)
  mesh.y = 200;

  return mesh;
};

// 3. Initialization Logic
onMounted(() => {
  if (!canvasRef.value) return;

  // Initialize the canvas application
  app = createCanvasApp(canvasRef.value);

  // Load the math and mesh plugins
  app.use(mathPlugin);
  app.use(meshTopologyPlugin);

  // Create the diamond mesh
  const diamond = createDiamondMesh(app, 200);

  // Add a rotation animation function (Update logic)
  diamond._updateFn = (dt, mesh) => {
    // dt is time elapsed since last frame (in ms)
    const rotationSpeed = 0.0005; // radians per millisecond
    mesh.rotation += rotationSpeed * dt;
  };

  // Add the mesh to the canvas root layer
  app.root.add(diamond);
});

// 4. Cleanup on component unmount
onBeforeUnmount(() => {
  if (app) {
    app.stop();
  }
});
</script>

<style scoped>
/* Basic styling for the component if needed */
.diamond-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

canvas {
  /* This style is in-line in the template but can be here too */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
</style>
