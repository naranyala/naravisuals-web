<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createCanvasApp } from '../../lib/engine/canvas_util.js';
import { geometryPlugin } from '../../lib/engine/geometryPlugin.js';

const canvasRef = ref(null);
const playing = ref(false);
let appInstance = null;
const animationName = 'seed-of-life-anim';

// Parameters
const R = 60; // Radius of the circles (smaller to fit more)
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const CX = CANVAS_WIDTH / 2;
const CY = CANVAS_HEIGHT / 2;
const STROKE_COLOR = '#000000';
const ANIMATION_SPEED = 1.5
const IS_LINE_VISIBLE = false;
const LINE_WIDTH = 1.5;

// Helper function to draw a point
const drawPoint = (app, x, y) => {
  // Outer circle
  app.draw.circle(app.Circle(x, y, 4), {
    stroke: STROKE_COLOR,
    width: 1
  });

  // Inner dot
  app.draw.point(app.Pt(x, y), {
    size: 1.5,
    color: STROKE_COLOR
  });
};

// Helper to draw one seed of life pattern at a given center
const drawSeedPattern = (app, centerX, centerY, delay) => {
  return function* () {
    // Center circle
    app.draw.circle(app.Circle(centerX, centerY, R), {
      stroke: STROKE_COLOR,
      width: LINE_WIDTH
    });
    yield delay;

    // Surrounding circles
    const surroundingCircles = [
      { x: centerX, y: centerY - R, r: R },  // Top
      { x: centerX + R, y: centerY, r: R },  // Right
      { x: centerX, y: centerY + R, r: R },  // Bottom
      { x: centerX - R, y: centerY, r: R }   // Left
    ];

    for (const circle of surroundingCircles) {
      app.draw.circle(app.Circle(circle.x, circle.y, circle.r), {
        stroke: STROKE_COLOR,
        width: LINE_WIDTH
      });
      yield delay;
    }

    if (IS_LINE_VISIBLE) {
      // Vertical line
      app.draw.line(app.Line(
        app.Pt(centerX, centerY - 2 * R),
        app.Pt(centerX, centerY + 2 * R)
      ), {
        stroke: STROKE_COLOR,
        width: LINE_WIDTH
      });
      yield delay * 0.6;

      // Horizontal line
      app.draw.line(app.Line(
        app.Pt(centerX - 2 * R, centerY),
        app.Pt(centerX + 2 * R, centerY)
      ), {
        stroke: STROKE_COLOR,
        width: LINE_WIDTH
      });
      yield delay * 0.6;
    }
  };
};

// Animated drawing sequence - 4 overlapping patterns
function* animateSeedOfLife(app) {
  const spacing = R * 2; // Distance between pattern centers
  const delay = 200 * ANIMATION_SPEED; // Apply speed multiplier

  // Define 4 pattern centers in a 2x2 grid
  const patterns = [
    { x: CX - spacing * 0.5, y: CY - spacing * 0.5 }, // Top-left
    { x: CX + spacing * 0.5, y: CY - spacing * 0.5 }, // Top-right
    { x: CX - spacing * 0.5, y: CY + spacing * 0.5 }, // Bottom-left
    { x: CX + spacing * 0.5, y: CY + spacing * 0.5 }  // Bottom-right
  ];

  // Draw each pattern
  for (const pattern of patterns) {
    yield* drawSeedPattern(app, pattern.x, pattern.y, delay)();
    yield delay * 1.5; // Pause between patterns
  }

  // Animation completed
  playing.value = false;
}

// Control functions
function togglePlay() {
  if (playing.value) {
    // Pause
    playing.value = false;
    appInstance.stopCoroutine(animationName);
  } else {
    // Play
    playing.value = true;
    appInstance.stopCoroutine(animationName);
    appInstance.start(animateSeedOfLife(appInstance), animationName);
  }
}

function reset() {
  // Stop animation
  playing.value = false;
  appInstance.stopCoroutine(animationName);

  // Clear all drawn objects
  appInstance.root.clear();
}

// Lifecycle hooks
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Create canvas app
  appInstance = createCanvasApp(canvas);

  // Load geometry plugin
  geometryPlugin(appInstance);
});

onUnmounted(() => {
  if (appInstance) {
    appInstance.stop();
  }
});
</script>

<template>
  <div class="canvas-wrapper">
    <div class="controls">
      <button @click="togglePlay">{{ playing ? 'Pause' : 'Play' }}</button>
      <button @click="reset">Reset</button>
    </div>
    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 12px;
}

.controls {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 20px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover {
  background: #333333;
}

button:active {
  background: #555555;
}

.canvas-container {
  border: 2px solid #333;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

canvas {
  display: block;
}
</style>
