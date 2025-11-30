<template>
  <div class="pie-chart-container">
    <canvas ref="canvasRef" width="500" height="500"></canvas>

    <div class="legend">
      <h3>Sales Breakdown</h3>
      <div v-for="item in chartData" :key="item.label" class="legend-item">
        <span class="color-box" :style="{ backgroundColor: item.color }"></span>
        {{ item.label }} ({{ item.value }}k units)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js';

// 1. Template Ref: This variable's name must match the 'ref' attribute on the <canvas>
const canvasRef = ref(null);

// Sample Pie Chart Data with colors that look good on a dark background
const chartData = [
  { label: 'Red Widgets', value: 15, color: '#FF7979' },
  { label: 'Blue Gadgets', value: 30, color: '#8BE9FE' },
  { label: 'Green Doodads', value: 55, color: '#50FA7B' },
];

/**
 * Creates and adds a pie slice object and its label to the canvas application.
 */
function createPieSlice(app, centerX, centerY, radius, startAngle, endAngle, color, labelText) {
  // === 1. Draw the Slice ===
  const sliceObject = {
    // The draw function is called by the canvas_util engine
    draw(ctx) {
      ctx.save();
      ctx.translate(centerX, centerY); // Move context origin to the center of the pie

      ctx.beginPath();
      ctx.moveTo(0, 0); // Move to the center of the pie
      ctx.arc(0, 0, radius, startAngle, endAngle); // Draw the arc
      ctx.lineTo(0, 0); // Close the path back to the center
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    },
  };
  app.root.add(sliceObject);

  // === 2. Draw the Label ===
  const midAngle = (startAngle + endAngle) / 2;
  // Position the label at 70% of the radius
  const labelRadius = radius * 0.7;

  const labelX = centerX + labelRadius * Math.cos(midAngle);
  const labelY = centerY + labelRadius * Math.sin(midAngle);

  // Use app.shapes.text from your shapesPlugin for a clean way to draw text
  app.shapes.text(
    labelText,
    labelX,
    labelY,
    '16px sans-serif',
    '#000', // Black color for contrast (optional, can be lighter color)
    { align: 'center', baseline: 'middle' }
  );
}

// 2. onMounted Hook: Run the code only after the component is mounted and the canvas is available
onMounted(() => {
  if (!canvasRef.value) {
    console.error('Canvas element not found!');
    return;
  }

  // --- Initial Setup ---
  const canvas = canvasRef.value;
  const app = createCanvasApp(canvas);
  // Load the shapes plugin
  app.use(shapesPlugin);

  // --- Chart Calculations ---
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.7; // Reduced size for center text

  let currentAngle = 0;

  // --- Draw Slices and Labels ---
  for (const item of chartData) {
    const percentage = (item.value / total);
    const sliceAngle = percentage * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Create the pie slice and its label
    createPieSlice(
      app,
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      item.color,
      `${Math.round(percentage * 100)}%` // Label is the percentage
    );

    // Update the starting angle for the next slice
    currentAngle = endAngle;
  }

  // --- Draw Center Label ---
  app.shapes.text(
    'TOTAL SALES',
    centerX,
    centerY - 20,
    '18px sans-serif',
    '#D4D4D4', // Light text for dark background
    { align: 'center', baseline: 'middle' }
  );

  app.shapes.text(
    `${total}k units`,
    centerX,
    centerY + 10,
    'bold 24px sans-serif',
    '#D4D4D4', // Light text for dark background
    { align: 'center', baseline: 'middle' }
  );
});
</script>

<style scoped>
/* Dark Theme Styles */
.pie-chart-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  padding: 30px;
  /* Dark background for the container */
  background-color: #1E1E1E;
  border: 1px solid #3A3A3A;
  border-radius: 12px;
  color: #D4D4D4;
  /* Light text color */
  font-family: sans-serif;
}

canvas {
  /* Dark border and background for the canvas */
  border: 2px solid #3A3A3A;
  background-color: #2D2D2D;
  border-radius: 4px;
}

.legend h3 {
  border-bottom: 1px solid #3A3A3A;
  padding-bottom: 5px;
  margin-bottom: 15px;
  color: #8BE9FE;
  /* Highlight the title */
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}

.color-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  border: 1px solid #555;
  border-radius: 3px;
}
</style>
