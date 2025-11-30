<template>
  <div class="line-chart-container">
    <canvas ref="canvasRef" width="700" height="400"></canvas>

    <div class="legend">
      <h3>Quarterly Performance</h3>
      <div v-for="series in chartData" :key="series.label" class="legend-item">
        <span class="color-box" :style="{ backgroundColor: series.color }"></span>
        {{ series.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js';

// Template Ref for the canvas element
const canvasRef = ref(null);

// Data for the multiple line charts (value is an arbitrary unit, max 100)
const chartData = [
  { label: 'Series A: North Region', color: '#8BE9FE', values: [10, 40, 20, 60, 30, 80] },
  { label: 'Series B: South Region', color: '#FF79C6', values: [30, 15, 70, 45, 90, 50] },
];

// Configuration for the chart layout
const config = {
  padding: 40,
  maxDataValue: 100,
  dotRadius: 6,
  gridLineColor: '#3A3A3A',
  labelColor: '#D4D4D4',
};

// 2. onMounted Hook: Set up the chart when the component is ready
onMounted(() => {
  if (!canvasRef.value) {
    console.error('Canvas element not found!');
    return;
  }

  // --- Initial Setup ---
  const canvas = canvasRef.value;
  const { padding, maxDataValue, dotRadius, gridLineColor, labelColor } = config;

  const app = createCanvasApp(canvas);
  app.use(shapesPlugin);

  // --- Chart Dimensions and Scaling ---
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const chartLeft = padding;
  const chartBottom = canvas.height - padding;
  const xDataPoints = chartData[0].values.length;

  const xStep = chartWidth / (xDataPoints - 1);
  const yScale = chartHeight / maxDataValue;

  // --- Drawing Grid and Labels (Context) ---
  // Draw X-axis
  app.shapes.line(chartLeft, chartBottom, chartLeft + chartWidth, chartBottom, { stroke: gridLineColor });
  // Draw Y-axis
  app.shapes.line(chartLeft, padding, chartLeft, chartBottom, { stroke: gridLineColor });

  // Y-Axis Labels and Grid Lines (Every 20 units)
  for (let i = 0; i <= maxDataValue; i += 20) {
    const y = chartBottom - i * yScale;
    // Horizontal Grid Line
    app.shapes.line(chartLeft, y, chartLeft + chartWidth, y, { stroke: gridLineColor, lineWidth: 0.5 });
    // Value Label
    app.shapes.text(String(i), chartLeft - 10, y, '12px sans-serif', labelColor, { align: 'right', baseline: 'middle' });
  }

  // X-Axis Labels (e.g., Q1, Q2, Q3...)
  for (let i = 0; i < xDataPoints; i++) {
    const x = chartLeft + i * xStep;
    app.shapes.text(`Q${i + 1}`, x, chartBottom + 15, '12px sans-serif', labelColor, { align: 'center', baseline: 'top' });
  }

  // --- Drawing Data Series (Line and Dots) ---
  chartData.forEach(series => {
    // 1. Create the custom object to draw the connecting line
    const lineObject = {
      series,
      draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.series.color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        this.series.values.forEach((value, i) => {
          const x = chartLeft + i * xStep;
          const y = chartBottom - value * yScale;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.restore();
      }
    };
    app.root.add(lineObject);

    // 2. Use shapesPlugin to draw the dot (circle) on each point
    series.values.forEach((value, i) => {
      const x = chartLeft + i * xStep;
      const y = chartBottom - value * yScale;

      app.shapes.circle(
        x,
        y,
        dotRadius,
        series.color,
        {
          // Use the chart background color as a stroke for better visibility
          stroke: '#2D2D2D',
          lineWidth: 3
        }
      );
    });
  });
});
</script>

<style scoped>
/* Dark Theme Styles from the previous example */
.line-chart-container {
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
  color: #50FA7B;
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
