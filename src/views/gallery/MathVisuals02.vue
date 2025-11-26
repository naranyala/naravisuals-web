<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Vector from '../../utilities/Vector.js';
import VectorRenderer from '../../utilities/VectorRenderer.js';

// Canvas and context references
const canvas = ref(null);
let renderer;
let animationId = null;

// State
const mode = ref('vector-projection');
const time = ref(0);

// Canvas dimensions
const width = 700;
const height = 500;

// Modes configuration
const modes = [
  { id: 'vector-projection', label: 'Vector Projection' },
  { id: 'vector-decomposition', label: 'Vector Decomposition' },
  { id: 'vector-reflection', label: 'Vector Reflection' },
  { id: 'coordinate-transformation', label: 'Coordinate Systems' },
  { id: 'vector-basis', label: 'Basis Vectors' },
  { id: 'gram-schmidt', label: 'Gram-Schmidt Process' }
];

// Mode descriptions
const descriptions = {
  'vector-projection': 'Projection finds the component of one vector along the direction of another. The projection vector shows how much of v lies in the direction of u.',
  'vector-decomposition': 'Decomposition breaks a vector into orthogonal components relative to a basis. Here we decompose v into components parallel and perpendicular to u.',
  'vector-reflection': 'Reflection mirrors a vector across another vector or line. The reflection shows the symmetric counterpart across the reference vector.',
  'coordinate-transformation': 'Transforming vectors between different coordinate systems. Watch how the same vector has different components in rotated coordinate frames.',
  'vector-basis': 'Basis vectors define coordinate systems. Any vector can be expressed as a linear combination of basis vectors with appropriate coefficients.',
  'gram-schmidt': 'The Gram-Schmidt process creates orthogonal basis vectors from a set of linearly independent vectors through sequential projection and subtraction.'
};

// Visualization modes
const visualizations = {
  'vector-projection': () => {
    const angle = time.value * 0.5;
    const u = new Vector(120, 40); // Reference vector
    const v = new Vector(Math.cos(angle) * 100, Math.sin(angle) * 100); // Rotating vector
    const projection = u.normalize().scale(v.dot(u.normalize())); // Projection of v onto u
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, u, '#3498db', 'u');
    renderer.drawVector(origin, v, '#e74c3c', 'v');
    renderer.drawVector(origin, projection, '#2ecc71', 'projᵤv');
    
    // Draw dashed line from v to projection
    renderer.drawDashedLine(v, projection);
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`u = ${u.toString()}`, 20, 30);
    renderer.ctx.fillText(`v = ${v.toString()}`, 20, 50);
    renderer.ctx.fillText(`projᵤv = ${projection.toString()}`, 20, 70);
    renderer.ctx.fillText(`Scalar projection: ${v.dot(u.normalize()).toFixed(2)}`, 20, 90);
  },

  'vector-decomposition': () => {
    const angle = time.value * 0.3;
    const u = new Vector(100, 60); // Reference vector
    const v = new Vector(80 * Math.cos(angle), 80 * Math.sin(angle)); // Vector to decompose
    const parallel = u.normalize().scale(v.dot(u.normalize())); // Parallel component
    const perpendicular = v.subtract(parallel); // Perpendicular component
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, u, '#3498db', 'u');
    renderer.drawVector(origin, v, '#e74c3c', 'v');
    renderer.drawVector(origin, parallel, '#2ecc71', 'v∥');
    renderer.drawVector(parallel, perpendicular, '#9b59b6', 'v⊥');
    
    // Draw construction lines
    renderer.drawDashedLine(v, parallel);
    renderer.drawDashedLine(v, perpendicular.add(parallel));
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`v = v∥ + v⊥ = ${v.toString()}`, 20, 30);
    renderer.ctx.fillText(`Parallel component v∥ = ${parallel.toString()}`, 20, 50);
    renderer.ctx.fillText(`Perpendicular component v⊥ = ${perpendicular.toString()}`, 20, 70);
    renderer.ctx.fillText(`v∥ · v⊥ = ${parallel.dot(perpendicular).toFixed(2)}`, 20, 90);
  },

  'vector-reflection': () => {
    const angle = time.value * 0.4;
    const mirror = new Vector(100, 80); // Mirror vector
    const v = new Vector(60 * Math.cos(angle), 60 * Math.sin(angle)); // Vector to reflect
    const projection = mirror.normalize().scale(v.dot(mirror.normalize()));
    const reflection = projection.scale(2).subtract(v); // Reflection formula
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, mirror, '#3498db', 'mirror');
    renderer.drawVector(origin, v, '#e74c3c', 'v');
    renderer.drawVector(origin, reflection, '#2ecc71', 'reflection');
    
    // Draw mirror line extended
    const mirrorExtended = mirror.scale(2);
    renderer.ctx.strokeStyle = '#3498db';
    renderer.ctx.setLineDash([5, 5]);
    renderer.ctx.lineWidth = 1;
    const screenStart = renderer.toScreen(mirrorExtended.scale(-1));
    const screenEnd = renderer.toScreen(mirrorExtended);
    renderer.ctx.beginPath();
    renderer.ctx.moveTo(screenStart.x, screenStart.y);
    renderer.ctx.lineTo(screenEnd.x, screenEnd.y);
    renderer.ctx.stroke();
    renderer.ctx.setLineDash([]);
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`Mirror vector: ${mirror.toString()}`, 20, 30);
    renderer.ctx.fillText(`Original vector: ${v.toString()}`, 20, 50);
    renderer.ctx.fillText(`Reflected vector: ${reflection.toString()}`, 20, 70);
  },

  'coordinate-transformation': () => {
    const rotationAngle = time.value * 0.2;
    const v = new Vector(80, 60); // Fixed vector
    const basisX = new Vector(Math.cos(rotationAngle), Math.sin(rotationAngle)).scale(50);
    const basisY = new Vector(-Math.sin(rotationAngle), Math.cos(rotationAngle)).scale(50);
    const origin = new Vector(0, 0);
    
    // Draw original coordinate system
    renderer.drawVector(origin, new Vector(80, 0), '#95a5a6', '');
    renderer.drawVector(origin, new Vector(0, 80), '#95a5a6', '');
    
    // Draw rotated coordinate system
    renderer.drawVector(origin, basisX.scale(1.6), '#3498db', 'x′');
    renderer.drawVector(origin, basisY.scale(1.6), '#e74c3c', 'y′');
    
    // Draw the vector
    renderer.drawVector(origin, v, '#2ecc71', 'v');
    
    // Calculate components in rotated system
    const xComponent = v.dot(basisX.normalize());
    const yComponent = v.dot(basisY.normalize());
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`Vector: ${v.toString()}`, 20, 30);
    renderer.ctx.fillText(`Rotation angle: ${(rotationAngle * 180/Math.PI).toFixed(1)}°`, 20, 50);
    renderer.ctx.fillText(`x′ component: ${xComponent.toFixed(2)}`, 20, 70);
    renderer.ctx.fillText(`y′ component: ${yComponent.toFixed(2)}`, 20, 90);
  },

  'vector-basis': () => {
    const angle = time.value * 0.3;
    const basis1 = new Vector(80, 40);
    const basis2 = new Vector(-20, 70);
    const coefficients = [1.5 + 0.5 * Math.sin(angle), 1 + 0.5 * Math.cos(angle)];
    const v = basis1.scale(coefficients[0]).add(basis2.scale(coefficients[1]));
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, basis1, '#3498db', 'b₁');
    renderer.drawVector(origin, basis2, '#e74c3c', 'b₂');
    renderer.drawVector(origin, v, '#2ecc71', 'v');
    
    // Draw component vectors
    renderer.drawVector(origin, basis1.scale(coefficients[0]), '#3498db', '');
    renderer.drawVector(basis1.scale(coefficients[0]), basis2.scale(coefficients[1]), '#e74c3c', '');
    
    renderer.ctx.setLineDash([5, 5]);
    renderer.drawDashedLine(v, basis1.scale(coefficients[0]));
    renderer.drawDashedLine(v, basis2.scale(coefficients[1]));
    renderer.ctx.setLineDash([]);
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`Basis: b₁ = ${basis1.toString()}, b₂ = ${basis2.toString()}`, 20, 30);
    renderer.ctx.fillText(`Coefficients: c₁ = ${coefficients[0].toFixed(2)}, c₂ = ${coefficients[1].toFixed(2)}`, 20, 50);
    renderer.ctx.fillText(`v = c₁b₁ + c₂b₂ = ${v.toString()}`, 20, 70);
  },

  'gram-schmidt': () => {
    const angle = time.value * 0.2;
    const v1 = new Vector(100, 30);
    const v2 = new Vector(40 + 20 * Math.cos(angle), 80 + 20 * Math.sin(angle));
    
    // Gram-Schmidt process
    const u1 = v1.normalize();
    const proj = u1.scale(v2.dot(u1));
    const u2 = v2.subtract(proj).normalize();
    
    const origin = new Vector(0, 0);
    
    renderer.drawVector(origin, v1, '#3498db', 'v₁');
    renderer.drawVector(origin, v2, '#e74c3c', 'v₂');
    renderer.drawVector(origin, proj, '#95a5a6', 'proj');
    renderer.drawVector(origin, u1.scale(50), '#2ecc71', 'u₁');
    renderer.drawVector(origin, u2.scale(50), '#9b59b6', 'u₂');
    
    // Draw construction lines
    renderer.drawDashedLine(v2, proj);
    
    renderer.drawPoint(origin, '#333');
    
    // Information text
    renderer.ctx.fillStyle = '#333';
    renderer.ctx.font = '14px Arial';
    renderer.ctx.fillText(`Original vectors: v₁, v₂`, 20, 30);
    renderer.ctx.fillText(`Orthogonal basis: u₁, u₂`, 20, 50);
    renderer.ctx.fillText(`u₁ · u₂ = ${u1.dot(u2).toFixed(3)}`, 20, 70);
    renderer.ctx.fillText(`Gram-Schmidt: u₂ = v₂ - projᵤ₁(v₂)`, 20, 90);
  }
};

// Render function
const renderCanvas = () => {
  if (!renderer) return;
  
  // Draw coordinate system with grid and numbers
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
      <h1>Vector Projection & Linear Algebra</h1>
      <p>Interactive visualizations of vector projection, decomposition, and basis transformations</p>
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
/* Styles remain the same as previous version */
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
