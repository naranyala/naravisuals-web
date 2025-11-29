<!-- MathVisuals03.vue -->
<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Vector from '../../utilities/Vector.js';
import VectorRenderer from '../../utilities/VectorRenderer.js';

const canvas = ref(null);
let renderer = null;
let animationId = null;

const mode = ref('linear-transformation');
const time = ref(0);

const width = 720;
const height = 560;

// ──────────────────────────────────────────────────────────────
// NEW MODES
// ──────────────────────────────────────────────────────────────
const modes = [
  { id: 'linear-transformation', label: 'Linear Transformation' },
  { id: 'eigen',                  label: 'Eigenvectors & Eigenvalues' },
  { id: 'determinant',            label: 'Determinant = Area' },
  { id: 'svd',                    label: 'Singular Value Decomposition' },
  { id: 'change-of-basis',        label: 'Change of Basis' },
  { id: 'least-squares',          label: 'Least Squares Regression' }
];

const descriptions = {
  'linear-transformation': 'Watch how a 2×2 matrix transforms the entire plane. The grid shows the effect of any linear transformation.',
  'eigen':                  'Eigenvectors are special directions that only get scaled (not rotated) by the transformation.',
  'determinant':            'The absolute value of the determinant is the signed area scaling factor of the transformation.',
  'svd':                    'Any matrix can be decomposed as U Σ Vᵀ — two rotations with a scaling in-between.',
  'change-of-basis':        'The same physical vector has different coordinates depending on which basis you choose.',
  'least-squares':          'Find the best-fit line by projecting points orthogonally onto the line (minimizes total squared error).'
};

// ──────────────────────────────────────────────────────────────
// Visualizations
// ──────────────────────────────────────────────────────────────
const visualizations = {
  // 1. Linear Transformation
  'linear-transformation': () => {
    const t = time.value;
    const A = [
      [1 + 0.7 * Math.cos(t), 0.5 * Math.sin(t * 1.3)],
      [0.3 * Math.sin(t * 0.9), 1 + 0.6 * Math.cos(t * 0.7)]
    ];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];

    drawGridAndBasis((v) => transform(v, A));
    drawInfo(`Matrix A ≈ [[${A[0][0].toFixed(2)}, ${A[0][1].toFixed(2)}], [${A[1][0].toFixed(2)}, ${A[1][1].toFixed(2)}]]   det(A) = ${det.toFixed(3)}`);
  },

  // 2. Eigenvectors & Eigenvalues
  'eigen': () => {
    const angle = time.value * 0.4;
    const λ1 = 1.8 + 0.4 * Math.sin(time.value);
    const λ2 = 0.6 + 0.2 * Math.cos(time.value * 1.3);
    const A = [
      [λ1 * Math.cos(angle) ** 2 + λ2 * Math.sin(angle) ** 2, (λ1 - λ2) * Math.cos(angle) * Math.sin(angle)],
      [(λ1 - λ2) * Math.cos(angle) * Math.sin(angle), λ1 * Math.sin(angle) ** 2 + λ2 * Math.cos(angle) ** 2]
    ];

    drawGridAndBasis((v) => transform(v, A));

    const ev1 = new Vector(Math.cos(angle), Math.sin(angle)).scale(80);
    const ev2 = new Vector(-Math.sin(angle), Math.cos(angle)).scale(60);

    renderer.drawVector(new Vector(0,0), ev1, '#e74c3c', 'eigenvector 1');
    renderer.drawVector(new Vector(0,0), transform(ev1, A), '#e74c3c', `λ₁v₁ (${λ1.toFixed(2)})`);
    renderer.drawVector(new Vector(0,0), ev2, '#3498db', 'eigenvector 2');
    renderer.drawVector(new Vector(0,0), transform(ev2, A), '#3498db', `λ₂v₂ (${λ2.toFixed(2)})`);

    drawInfo(`λ₁ ≈ ${λ1.toFixed(2)}    λ₂ ≈ ${λ2.toFixed(2)}`);
  },

  // 3. Determinant = Area
  'determinant': () => {
    const t = time.value * 0.5;
    const a = new Vector(90 + 40 * Math.cos(t), 30 * Math.sin(t * 1.7));
    const b = new Vector(-20 + 50 * Math.cos(t * 0.9), 80 + 30 * Math.sin(t));

    renderer.drawVector(new Vector(0,0), a, '#3498db', 'a');
    renderer.drawVector(new Vector(0,0), b, '#e74c3c', 'b');
    renderer.drawVector(a, b, '#2ecc71', 'a + b');

    // Parallelogram
    const vertices = [
      new Vector(0,0),
      a,
      a.clone().add(b),
      b
    ];
    renderer.ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
    renderer.ctx.strokeStyle = '#2ecc71';
    renderer.ctx.lineWidth = 2;
    renderer.ctx.beginPath();
    vertices.forEach((v, i) => {
      const s = renderer.toScreen(v);
      i === 0 ? renderer.ctx.moveTo(s.x, s.y) : renderer.ctx.lineTo(s.x, s.y);
    });
    renderer.ctx.closePath();
    renderer.ctx.fill();
    renderer.ctx.stroke();

    const det = a.x * b.y - a.y * b.x;
    drawInfo(`Area of parallelogram = |a × b| = ${Math.abs(det).toFixed(1)} (det = ${det.toFixed(1)})`);
  },

  // 4. SVD
  'svd': () => {
    const t = time.value;
    const v = new Vector(100 * Math.cos(t), 100 * Math.sin(t));
    const σ1 = 2 + Math.sin(t * 0.7);
    const σ2 = 0.8 + 0.3 * Math.cos(t * 1.4);
    const θ1 = t * 0.6;
    const θ2 = t * 0.3;

    // Vᵀ rotation
    const vRot = v.rotate(-θ2);
    renderer.drawVector(new Vector(0,0), v, '#95a5a6', 'v');
    renderer.drawDashedLine(v, vRot);
    renderer.drawVector(new Vector(0,0), vRot, '#3498db', "Vᵀv");

    // Σ scaling
    const scaled = new Vector(vRot.x * σ1, vRot.y * σ2);
    renderer.drawVector(new Vector(0,0), scaled, '#e74c3c', "Σ Vᵀv");

    // U rotation
    const result = scaled.rotate(θ1);
    renderer.drawVector(new Vector(0,0), result, '#2ecc71', "U Σ Vᵀ v = Av");

    drawInfo(`σ₁ = ${σ1.toFixed(2)}   σ₂ = ${σ2.toFixed(2)}   SVD = rotation → scale → rotation`);
  },

  // 5. Change of Basis
  'change-of-basis': () => {
    const b1 = new Vector(80, 20);
    const b2 = new Vector(-30, 70);
    const coeffs = [1.2 + 0.6 * Math.sin(time.value), 0.8 + 0.4 * Math.cos(time.value * 1.3)];
    const v = b1.scale(coeffs[0]).add(b2.scale(coeffs[1]));

    // Standard basis (gray)
    renderer.drawVector(new Vector(0,0), new Vector(100,0), '#bdc3c7', 'e₁');
    renderer.drawVector(new Vector(0,0), new Vector(0,100), '#bdc3c7', 'e₂');

    // Custom basis
    renderer.drawVector(new Vector(0,0), b1, '#3498db', 'b₁');
    renderer.drawVector(new Vector(0,0), b2, '#e74c3c', 'b₂');

    // Vector in both bases
    renderer.drawVector(new Vector(0,0), v, '#2ecc71', `v = ${coeffs[0].toFixed(2)} b₁ + ${coeffs[1].toFixed(2)} b₂`);

    // Coordinates rectangle in custom basis
    renderer.ctx.strokeStyle = '#2ecc71';
    renderer.ctx.setLineDash([6, 6]);
    renderer.ctx.strokeRect(
      ...renderer.toScreen(new Vector(0,0)),
      ...renderer.toScreen(b1).x - renderer.toScreen(new Vector(0,0)).x,
      ...renderer.toScreen(b2).y - renderer.toScreen(new Vector(0,0)).y
    );
    renderer.ctx.setLineDash([]);

    drawInfo(`Standard coords: (${v.x.toFixed(1)}, ${v.y.toFixed(1)})   Custom coords: [${coeffs[0].toFixed(2)}, ${coeffs[1].toFixed(2)}]₍b₎`);
  },

  // 6. Least Squares
  'least-squares': () => {
    const points = [
      new Vector(-80, 100), new Vector(-40, 60), new Vector(0, 10),
      new Vector(30, -20), new Vector(70, 20), new Vector(100, 80)
    ];

    const dir = new Vector(Math.cos(time.value * 0.3), Math.sin(time.value * 0.3));
    const lineVec = dir.normalize().scale(200);

    // Draw points
    points.forEach(p => renderer.drawPoint(p, '#e74c3c', 6));

    // Draw regression line
    renderer.drawVector(new Vector(0,0), lineVec, '#3498db', 'best-fit line');
    renderer.drawVector(new Vector(0,0), lineVec.scale(-1), '#3498db');

    // Orthogonal projections + error lines
    let totalError = 0;
    points.forEach(p => {
      const proj = dir.normalize().scale(p.dot(dir.normalize()));
      renderer.drawDashedLine(p, proj, '#95a5a6');
      renderer.drawPoint(proj, '#2ecc71', 5);
      totalError += p.subtract(proj).magnitudeSq();
    });

    drawInfo(`Least-squares solution: minimize Σ error² = ${totalError.toFixed(1)}`);
  }
};

// ──────────────────────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────────────────────
function transform(v, matrix) {
  return new Vector(
    v.x * matrix[0][0] + v.y * matrix[0][1],
    v.x * matrix[1][0] + v.y * matrix[1][1]
  );
}

function drawGridAndBasis(transformFn) {
  const gridSize = 30;
  renderer.ctx.strokeStyle = '#e0e0e0';
  renderer.ctx.lineWidth = 1;

  for (let i = -15; i <= 15; i++) {
    for (let j = -15; j <= 15; j++) {
      const orig = new Vector(i * gridSize, j * gridSize);
      const dest = transformFn(orig);

      // Original faint grid
      renderer.ctx.beginPath();
      const s1 = renderer.toScreen(orig);
      const s2 = renderer.toScreen(dest);
      renderer.ctx.moveTo(s1.x, s1.y);
      renderer.ctx.lineTo(s2.x, s2.y);
      renderer.ctx.stroke();

      if (i === 0 && j === 0) continue;
      if (i === 0) renderer.drawVector(orig, dest, '#3498db', '', 2);
      if (j === 0) renderer.drawVector(orig, dest, '#e74c3c', '', 2);
    }
  }
}

function drawInfo(text) {
  renderer.ctx.fillStyle = '#333';
  renderer.ctx.font = 'bold 15px Arial';
  renderer.ctx.fillText(text, 20, 40);
}

// ──────────────────────────────────────────────────────────────
// Animation & Rendering
// ──────────────────────────────────────────────────────────────
const render = () => {
  if (!renderer) return;
  renderer.drawCoordinateSystem(true, true);
  visualizations[mode.value]();
};

const animate = () => {
  time.value += 0.016;
  render();
  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = width;
    canvas.value.height = height;
    const ctx = canvas.value.getContext('2d');
    renderer = new VectorRenderer(ctx, width, height);
    animate();
  }
});

onUnmounted(() => cancelAnimationFrame(animationId));
watch(mode, render);
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Advanced Linear Algebra Visualizations</h1>
      <p>Interactive demos of transformations, eigenvalues, SVD, change of basis, and more</p>
    </div>

    <div class="button-group">
      <button
        v-for="m in modes"
        :key="m.id"
        @click="mode = m.id"
        :class="['mode-button', { active: mode === m.id }]"
      >{{ m.label }}</button>
    </div>

    <canvas ref="canvas" class="canvas" :width="width" :height="height"></canvas>

    <div class="description-box">
      <h3>{{ modes.find(m => m.id === mode)?.label }}</h3>
      <p>{{ descriptions[mode] }}</p>
    </div>
  </div>
</template>

<style scoped>
.container { display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; font-family: system-ui, sans-serif; color: white; }
.header h1 { font-size: 2.2rem; margin: 0; }
.header p { opacity: 0.9; }
.button-group { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; }
.mode-button { padding: 0.9rem 1.6rem; border: none; border-radius: 50px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.mode-button:hover { background: rgba(255,255,255,0.3); transform: translateY(-3px); }
.mode-button.active { background: white; color: #667eea; transform: scale(1.1); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
.canvas { border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); background: white; }
.description-box { 
  background: rgba(255,255,255,0.95); 
  /* color: #333;  */
  color: black;
  padding: 1.8rem; border-radius: 16px; max-width: 680px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); 

  h3 { color: black; }
}
</style>
