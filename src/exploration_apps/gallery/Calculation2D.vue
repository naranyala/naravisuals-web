<script setup>
import { ref, onMounted } from 'vue';
import Vector from '../../utilities/Vector.js';

// Canvas and context references
const canvas = ref(null);
let ctx;

// Points and vectors for demonstration
const points = [
  new Vector(100, 100),
  new Vector(300, 200),
  new Vector(200, 300),
];

// --- Drawing helpers ---
const drawBackground = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
};

const drawAxes = () => {
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;

  // X axis
  ctx.beginPath();
  ctx.moveTo(0, canvas.value.height / 2);
  ctx.lineTo(canvas.value.width, canvas.value.height / 2);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(canvas.value.width / 2, 0);
  ctx.lineTo(canvas.value.width / 2, canvas.value.height);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = 'black';
  ctx.font = '12px Arial';
  ctx.fillText('X', canvas.value.width - 15, canvas.value.height / 2 - 5);
  ctx.fillText('Y', canvas.value.width / 2 + 5, 15);
};

const drawPoint = (point, color = 'red', size = 5) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
  ctx.fill();
};

const drawLine = (start, end, color = 'blue', width = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
};

const drawText = (text, point, color = 'black') => {
  ctx.fillStyle = color;
  ctx.font = '12px Arial';
  ctx.fillText(text, point.x + 10, point.y - 10);
};

// --- Render ---
const renderCanvas = () => {
  drawBackground();
  drawAxes();

  // Draw all points
  points.forEach((point, index) => {
    drawPoint(point, 'red', 8);
    drawText(`Point ${index + 1}: ${point.toString()}`, point);
  });

  // Draw polygon lines
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(points[i], points[i + 1], 'blue', 2);
  }
  if (points.length > 1) {
    drawLine(points[points.length - 1], points[0], 'blue', 2);
  }
};

// --- Lifecycle ---
onMounted(() => {
  canvas.value.width = 400;
  canvas.value.height = 400;
  ctx = canvas.value.getContext('2d');
  renderCanvas();
});
</script>

<template>
  <div>
    <h2>Canvas with White Background and Axes</h2>
    <canvas ref="canvas" style="border: 1px solid black;"></canvas>
  </div>
</template>

