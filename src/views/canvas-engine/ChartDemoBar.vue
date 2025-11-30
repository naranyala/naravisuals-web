<template>
  <div class="bar-chart-container">
    <h2>{{ direction === 'vertical' ? 'Vertical' : 'Horizontal' }} Bar Chart</h2>
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js';

// --- Component Props ---
const props = defineProps({
  direction: {
    type: String,
    default: 'vertical', // Accepts 'vertical' or 'horizontal'
    validator: (value) => ['vertical', 'horizontal'].includes(value),
  },
});

// Template Ref for the canvas element
const canvasRef = ref(null);

// Configuration and Data
const canvasWidth = 600;
const canvasHeight = 400;
const config = {
  padding: 40,
  maxDataValue: 100,
  barGap: 10,
  gridLineColor: '#3A3A3A',
  labelColor: '#D4D4D4',
  barDefaultColor: '#50FA7B',
};

const chartData = [
  { category: 'Product A', value: 45, color: '#FF79C6' },
  { category: 'Product B', value: 80, color: '#8BE9FE' },
  { category: 'Product C', value: 60, color: '#50FA7B' },
  { category: 'Product D', value: 25, color: '#FFB86C' },
  { category: 'Product E', value: 95, color: '#F1FA8C' },
];


// --- Drawing Logic ---
onMounted(() => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const { padding, maxDataValue, barGap, gridLineColor, labelColor } = config;

  const app = createCanvasApp(canvas);
  app.use(shapesPlugin);

  // === 1. Calculate Dimensions based on Direction ===
  const isVertical = props.direction === 'vertical';
  const dataCount = chartData.length;

  const chartAreaWidth = canvasWidth - padding * 2;
  const chartAreaHeight = canvasHeight - padding * 2;

  const chartLeft = padding;
  const chartRight = canvasWidth - padding;
  const chartTop = padding;
  const chartBottom = canvasHeight - padding;

  // Scaling depends on the direction
  const axisLength = isVertical ? chartAreaWidth : chartAreaHeight; // Category Axis length
  const valueLength = isVertical ? chartAreaHeight : chartAreaWidth; // Value Axis length

  const barSpace = axisLength / dataCount;
  const barSize = barSpace - barGap; // Width (Vertical) or Height (Horizontal) of the bar

  const valueScale = valueLength / maxDataValue;


  // === 2. Draw Axes and Grid ===
  // Primary Axis (Category Axis)
  app.shapes.line(chartLeft, chartBottom, chartRight, chartBottom, { stroke: gridLineColor }); // X-axis
  app.shapes.line(chartLeft, chartTop, chartLeft, chartBottom, { stroke: gridLineColor }); // Y-axis

  // Value Axis Grid Lines and Labels (e.g., 20, 40, 60...)
  for (let i = 0; i <= maxDataValue; i += 20) {
    // If vertical, value axis is Y (vertical line), start at chartLeft
    // If horizontal, value axis is X (horizontal line), start at chartBottom
    const pos = i * valueScale;

    if (isVertical) {
      // Y-axis grid
      const y = chartBottom - pos;
      app.shapes.line(chartLeft, y, chartRight, y, { stroke: gridLineColor, lineWidth: 0.5 });
      app.shapes.text(String(i), chartLeft - 10, y, '12px sans-serif', labelColor, { align: 'right', baseline: 'middle' });
    } else {
      // X-axis grid
      const x = chartLeft + pos;
      app.shapes.line(x, chartTop, x, chartBottom, { stroke: gridLineColor, lineWidth: 0.5 });
      app.shapes.text(String(i), x, chartBottom + 15, '12px sans-serif', labelColor, { align: 'center', baseline: 'top' });
    }
  }


  // === 3. Draw Bars and Category Labels ===
  chartData.forEach((item, index) => {
    const startPos = padding + index * barSpace + barGap / 2; // Start position on the category axis
    const barLength = item.value * valueScale;

    if (isVertical) {
      // Vertical Configuration
      const barX = startPos;
      const barY = chartBottom - barLength; // Rect starts at top-left corner
      const barW = barSize;
      const barH = barLength;

      // Bar
      app.shapes.rect(barX, barY, barW, barH, item.color);

      // Category Label (below the bar)
      app.shapes.text(item.category, barX + barW / 2, chartBottom + 15, '14px sans-serif', labelColor, { align: 'center', baseline: 'top' });

    } else {
      // Horizontal Configuration
      const barX = chartLeft; // Rect starts at the left Y-axis
      const barY = startPos;
      const barW = barLength;
      const barH = barSize;

      // Bar
      app.shapes.rect(barX, barY, barW, barH, item.color);

      // Category Label (left of the bar)
      app.shapes.text(item.category, chartLeft - 10, barY + barH / 2, '14px sans-serif', labelColor, { align: 'right', baseline: 'middle' });
    }
  });

});
</script>

<style scoped>
/* Dark Theme Styles */
.bar-chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
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

h2 {
  color: #8BE9FE;
  margin: 0;
}
</style>
