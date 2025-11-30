<script setup>
import { ref, onMounted, onUnmounted } from "vue"
// How to use the fixed 3D shapes with your canvas engine
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { shapes3DPlugin } from '../../lib/engine/shapes3DPlugin.js';

onMounted(() => {
  const canvas = document.getElementById('sample');
  const app = createCanvasApp(canvas);

  // Use the 3D plugin
  app.use(shapes3DPlugin);

  // Create 3D shapes
  const cube = app.create3DShape('cube', { x: 200, y: 150, scale: 1.5 });
  const sphere = app.create3DShape('sphere', { x: 400, y: 150, autoRotate: true });
  const pyramid = app.create3DShape('pyramid', { x: 600, y: 150 });

  // You can still use all the canvas engine features
  app.animateTo(cube, 'x', 300, 2000);


})
</script>

<template>
  <canvas id="sample"></canvas>
</template>
