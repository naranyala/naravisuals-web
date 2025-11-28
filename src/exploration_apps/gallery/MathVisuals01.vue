<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Vector from '../../utilities/Vector.js';
import VectorRenderer from '../../utilities/VectorRenderer.js';

// Canvas and context references
const canvas = ref(null);
let renderer;
let animationId = null;

// State
const mode = ref('vector-addition');
const time = ref(0);

// Canvas dimensions
const width = 700;
const height = 500;

// Modes configuration
const modes = [
  { id: 'vector-addition', label: 'Vector Addition' },
  { id: 'vector-subtraction', label: 'Vector Subtraction' },
  { id: 'dot-product', label: 'Dot Product' },
  { id: 'cross-product', label: 'Cross Product' },
  { id: 'rotation', label: 'Rotation' },
  { id: 'lerp', label: 'Linear Interpolation' }
];

// Mode descriptions
const descriptions = {
  'vector-addition': 'Adding vectors creates a new vector from the origin to the combined displacement.',
  'vector-subtraction': 'Subtracting vectors gives the displacement from one vector to another.',
  'dot-product': 'The dot product measures how much two vectors point in the same direction. The projection shows the component of v2 along v1.',
  'cross-product': 'The cross product (2D scalar) gives the signed area of the parallelogram formed by two vectors. Positive = counter-clockwise, negative = clockwise.',
  'rotation': 'Rotating a vector around the origin by different angles. Watch as multiple rotations animate together.',
  'lerp': 'Linear interpolation smoothly transitions between two vectors. Parameter t ranges from 0 (start) to 1 (end).'
};

// Visualization modes
const visualizations = {
  'vector-addition': () => {
    const v1 = new Vector(100, 80);
    const v2 = new Vector(60, 120);
    const v3 = v1.add(v2);
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, v1, '#e74c3c', 'v1');
    renderer.drawVector(v1, v2, '#3498db', 'v2');
    renderer.drawVector(origin, v3, '#2ecc71', 'v1 + v2');
    renderer.drawPoint(origin, '#333');
    renderer.drawPoint(v1, '#e74c3c');
    renderer.drawPoint(v3, '#2ecc71');
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`v1 = ${v1.toString()}`, 20, 30);
    renderer.ctx.fillText(`v2 = ${v2.toString()}`, 20, 50);
    renderer.ctx.fillText(`v1 + v2 = ${v3.toString()}`, 20, 70);
  },

  'vector-subtraction': () => {
    const v1 = new Vector(120, 100);
    const v2 = new Vector(60, 140);
    const v3 = v1.subtract(v2);
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, v1, '#e74c3c', 'v1');
    renderer.drawVector(origin, v2, '#3498db', 'v2');
    renderer.drawVector(v2, v3, '#9b59b6', 'v1 - v2');
    renderer.drawPoint(origin, '#333');
    renderer.drawPoint(v1, '#e74c3c');
    renderer.drawPoint(v2, '#3498db');
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`v1 = ${v1.toString()}`, 20, 30);
    renderer.ctx.fillText(`v2 = ${v2.toString()}`, 20, 50);
    renderer.ctx.fillText(`v1 - v2 = ${v3.toString()}`, 20, 70);
  },

  'dot-product': () => {
    const angle = time.value * 0.5;
    const v1 = new Vector(120, 0);
    const v2 = new Vector(Math.cos(angle) * 100, Math.sin(angle) * 100);
    const dotProduct = v1.dot(v2);
    const projection = v1.normalize().scale(dotProduct / v1.magnitude());
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, v1, '#e74c3c', 'v1');
    renderer.drawVector(origin, v2, '#3498db', 'v2');
    renderer.drawVector(origin, projection, '#f39c12', 'projection');
    
    // Draw dashed line from v2 to projection
    renderer.drawDashedLine(v2, projection);
    
    renderer.drawPoint(origin, '#333');
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`v1 · v2 = ${dotProduct.toFixed(2)}`, 20, 30);
    renderer.ctx.fillText(`|v1| = ${v1.magnitude().toFixed(2)}`, 20, 50);
    renderer.ctx.fillText(`|v2| = ${v2.magnitude().toFixed(2)}`, 20, 70);
    renderer.ctx.fillText(`cos(θ) = ${(dotProduct / (v1.magnitude() * v2.magnitude())).toFixed(3)}`, 20, 90);
  },

  'rotation': () => {
    const v = new Vector(120, 60);
    const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI];
    const colors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#3498db'];
    const origin = new Vector(0, 0);
    
    angles.forEach((angle, i) => {
      const rotated = v.rotate(angle + time.value * 0.3);
      renderer.drawVector(origin, rotated, colors[i], `${(angle * 180 / Math.PI).toFixed(0)}°`);
    });
    
    renderer.drawPoint(origin, '#333', 8);
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText('Vector Rotation', 20, 30);
    renderer.ctx.fillText('Original: ' + v.toString(), 20, 50);
  },

  'lerp': () => {
    const v1 = new Vector(-150, -100);
    const v2 = new Vector(150, 120);
    const t = (Math.sin(time.value * 0.8) + 1) / 2;
    const lerped = v1.lerp(v2, t);
    const origin = new Vector(0, 0);
    
    renderer.drawPoint(v1, '#e74c3c', 10);
    renderer.drawPoint(v2, '#3498db', 10);
    renderer.drawPoint(lerped, '#2ecc71', 12);
    
    // Draw dashed line between v1 and v2
    renderer.drawDashedLine(v1, v2, '#95a5a6', 2);
    
    renderer.drawText('Start', v1, '#e74c3c');
    renderer.drawText('End', v2, '#3498db');
    renderer.drawText('Lerp', lerped, '#2ecc71');
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`t = ${t.toFixed(3)}`, 20, 30);
    renderer.ctx.fillText(`lerp(v1, v2, t) = ${lerped.toString()}`, 20, 50);
  },

  'cross-product': () => {
    const angle = time.value * 0.5;
    const v1 = new Vector(100, 50);
    const v2 = new Vector(Math.cos(angle) * 80, Math.sin(angle) * 80);
    const crossProduct = v1.cross(v2);
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, v1, '#e74c3c', 'v1');
    renderer.drawVector(origin, v2, '#3498db', 'v2');
    
    // Draw parallelogram
    const parallelogramPoints = [
      origin,
      v1,
      v1.add(v2),
      v2
    ];
    
    renderer.ctx.fillStyle = crossProduct > 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
    renderer.ctx.beginPath();
    const screenPoints = parallelogramPoints.map(p => renderer.toScreen(p));
    renderer.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    screenPoints.forEach(p => renderer.ctx.lineTo(p.x, p.y));
    renderer.ctx.closePath();
    renderer.ctx.fill();
    
    renderer.drawPoint(origin, '#333');
    
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`v1 × v2 = ${crossProduct.toFixed(2)}`, 20, 30);
    renderer.ctx.fillText(`Area = ${Math.abs(crossProduct).toFixed(2)}`, 20, 50);
    renderer.ctx.fillText(`Direction: ${crossProduct > 0 ? 'CCW' : 'CW'}`, 20, 70);
  }
};

// Render function
const renderCanvas = () => {
  if (!renderer) return;
  
  // Draw coordinate system with grid, axes, and coordinate numbers
  renderer.drawCoordinateSystem(true, true);
  
  const visualization = visualizations[mode.value];
  if (visualization) {
    visualization();
  }
};

// Animation loop
const animate = () => {
  time.value += 0.02;
  renderCanvas();
  animationId = requestAnimationFrame(animate);
};

// Lifecycle hooks
onMounted(() => {
  if (canvas.value) {
    canvas.value.width = width;
    canvas.value.height = height;
    const ctx = canvas.value.getContext('2d');
    renderer = new VectorRenderer(ctx, width, height);
    animate();
  }
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

// Watch for mode changes
watch(mode, () => {
  renderCanvas();
});
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>2D Vector Mathematics</h1>
      <p>Interactive visualizations of vector operations</p>
    </div>

    <div class="button-group">
      <button
        v-for="m in modes"
        :key="m.id"
        @click="mode = m.id"
        :class="['mode-button', { active: mode === m.id }]"
      >
        {{ m.label }}
      </button>
    </div>

    <canvas ref="canvas" class="canvas" />

    <div class="description-box">
      <h3>{{ modes.find(m => m.id === mode)?.label }}</h3>
      <p>{{ descriptions[mode] }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.header p {
  color: #546e7a;
  margin: 0;
  font-size: 1rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.mode-button {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
  color: #37474f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.mode-button:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mode-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.canvas {
  display: block;
  border: 4px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  background: white;
}

.description-box {
  background: white;
  color: black;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.description-box h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
}

.description-box p {
  color: #546e7a;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .button-group {
    gap: 0.5rem;
  }

  .mode-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }

  .canvas {
    max-width: 100%;
    height: auto;
  }

  .description-box {
    padding: 1.25rem;
  }
}
</style>
