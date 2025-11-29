<!-- MathVisuals04.vue -->
<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Vector from '../../utilities/Vector.js';
import VectorRenderer from '../../utilities/VectorRenderer.js';

const canvas = ref(null);
let renderer = null;
let animationId = null;

const mode = ref('complex-multiplication');
const time = ref(0);
const mousePos = ref(new Vector(0, 0));

const width = 740;
const height = 580;

// ──────────────────────────────────────────────────────────────
// MODES & DESCRIPTIONS
// ──────────────────────────────────────────────────────────────
const modes = [
  { id: 'complex-multiplication', label: 'Complex Multiplication' },
  { id: 'fourier-phasors',        label: 'Fourier Series Phasors' },
  { id: 'mobius',                 label: 'Möbius Transformations' },
  { id: 'polar-dance',            label: 'Polar → Cartesian' },
  { id: 'vector-field',           label: 'Vector Field Flow' },
  { id: 'quaternions',            label: 'Quaternion 3D Rotation' }
];

const descriptions = {
  'complex-multiplication': 'Multiplying complex numbers = rotate + scale. Drag to multiply by any complex number!',
  'fourier-phasors': 'Any periodic function is a sum of rotating arrows (phasors) in the complex plane.',
  'mobius': 'Conformal maps that send circles to circles (and lines!). Includes inversion geometry.',
  'polar-dance': 'Watch r = f(θ) trace beautiful curves as θ increases — roses, spirals, limaçons.',
  'vector-field': 'Click and drag to feel the flow. Particles follow the vector field in real time.',
  'quaternions': '3D rotations without gimbal lock — powered by quaternion multiplication.'
};

// ──────────────────────────────────────────────────────────────
// VISUALIZATIONS
// ──────────────────────────────────────────────────────────────
const visualizations = {
  'complex-multiplication': () => {
    const z = mousePos.value.distance(new Vector(0,0)) > 10 
      ? mousePos.value.clone().scale(0.8) 
      : new Vector(100, 50);

    const fixed = new Vector(120, 80);
    const product = fixed.scale(z.x / 100).rotate(z.angle());

    renderer.drawVector(new Vector(0,0), fixed, '#3498db', 'a');
    renderer.drawVector(new Vector(0,0), z, '#e74c3c', 'b (drag me)');
    renderer.drawVector(new Vector(0,0), product, '#2ecc71', 'a × b');

    renderer.drawDashedLine(fixed, product);
    renderer.drawPoint(fixed, '#3498db', 6);
    renderer.drawPoint(z, '#e74c3c', 6);

    drawInfo(`a = ${fixed.toString()}   b ≈ ${z.toString()}   a×b = ${product.toString()}`);
    drawInfo(`|a×b| = |a|×|b| = ${product.magnitude().toFixed(1)}`, 60);
    drawInfo(`arg(a×b) = arg(a)+arg(b) = ${(product.angle()*180/Math.PI).toFixed(1)}°`, 80);
  },

  'fourier-phasors': () => {
    const N = 9;
    let sum = new Vector(0, 0);
    const center = new Vector(-100, 0);
    const freq = time.value * 2;

    for (let k = -N; k <= N; k++) {
      if (k === 0) continue;
      const amp = 80 / (k * Math.PI) * (k % 2 === 0 ? 0 : 1);
      const angle = freq * k;
      const phasor = new Vector(Math.cos(angle), Math.sin(angle)).scale(amp);
      const start = k === -N ? center : sum.clone().add(center);

      renderer.drawVector(start, phasor, k > 0 ? '#e74c3c' : '#3498db', k > 0 ? `+${k}` : `${k}`);
      sum = sum.add(phasor);
    }

    const y = sum.add(center).y;
    renderer.ctx.strokeStyle = '#2ecc71';
    renderer.ctx.lineWidth = 3;
    renderer.ctx.beginPath();
    renderer.ctx.moveTo(150, height/2 - 100);
    for (let x = 150; x < width - 50; x++) {
      const t = (x - 150) * 0.05 + time.value * 2;
      let val = 0;
      for (let k = 1; k <= N; k += 2) val += 4/(k*Math.PI) * Math.sin(t * k);
      renderer.ctx.lineTo(x, height/2 - val * 100);
    }
    renderer.ctx.stroke();

    drawInfo(`Square wave ≈ Σ (4/(nπ)) sin(nt) for odd n`, 30);
  },

  'mobius': () => {
    const c = new Vector(
      60 * Math.cos(time.value * 0.4),
      60 * Math.sin(time.value * 0.6)
    );
    const mobius = (z) => z.clone().add(c).inverse(); // z → 1/(z - c) + something, but simplified

    drawGridAndBasis(z => {
      const w = z.clone().subtract(c);
      if (w.magnitude() < 10) return new Vector(9999, 9999);
      return w.inverse().add(c.scale(0.5));
    });

    renderer.drawPoint(c, '#e74c3c', 8);
    drawInfo(`Möbius: z → 1/(z - c)   c = ${c.toString()}`, 30);
  },

  'polar-dance': () => {
    const t = time.value * 0.8;
    const petals = 5 + Math.floor(Math.abs(Math.sin(t * 0.1)) * 6);
    const r = (theta) => 100 + 80 * Math.cos(petals * theta + t);

    renderer.ctx.strokeStyle = '#9b59b6';
    renderer.ctx.lineWidth = 3;
    renderer.ctx.beginPath();
    let first = true;
    for (let theta = 0; theta < Math.PI * 8; theta += 0.02) {
      const rad = r(theta);
      const x = rad * Math.cos(theta);
      const y = rad * Math.sin(theta);
      const p = new Vector(x, y);
      const s = renderer.toScreen(p);
      first ? renderer.ctx.moveTo(s.x, s.y) : renderer.ctx.lineTo(s.x, s.y);
      first = false;
    }
    renderer.ctx.stroke();

    drawInfo(`r = 100 + 80 cos(${petals === 1 ? '' : petals}(θ + t))   Rose curve with ${petals} petals`);
  },

  'vector-field': () => {
    const field = (x, y) => new Vector(
      -y + Math.sin(x * 0.02 + time.value),
      x + Math.cos(y * 0.02 + time.value * 1.3)
    ).scale(0.3);

    // Field arrows
    for (let x = -width/2 + 50; x < width/2; x += 60) {
      for (let y = -height/2 + 50; y < height/2; y += 60) {
        const v = new Vector(x, y);
        const f = field(x, y);
        renderer.drawVector(v, f, '#95a5a6', '', 2, 8);
      }
    }

    // Particles following flow
    const particles = 30;
    for (let i = 0; i < particles; i++) {
      const phase = i / particles * Math.PI * 2;
      const pos = new Vector(
        150 * Math.cos(time.value * 0.5 + phase),
        150 * Math.sin(time.value * 0.5 + phase)
      );
      const vel = field(pos.x, pos.y);
      const next = pos.add(vel.scale(2));
      renderer.drawPoint(pos, '#2ecc71', 5);
      renderer.ctx.strokeStyle = '#2ecc71';
      renderer.ctx.globalAlpha = 0.4;
      renderer.ctx.lineWidth = 2;
      renderer.ctx.beginPath();
      renderer.ctx.moveTo(...renderer.toScreen(pos));
      renderer.ctx.lineTo(...renderer.toScreen(next));
      renderer.ctx.stroke();
      renderer.ctx.globalAlpha = 1;
    }

    drawInfo(`Dynamic vector field: ∂/∂t = (−y, x) + noise`);
  },

  'quaternions': () => {
    const axis = new Vector(
      Math.sin(time.value * 0.7),
      Math.sin(time.value * 0.5),
      Math.cos(time.value * 0.6)
    ).normalize();
    const angle = time.value * 0.8;
    const q = quaternionFromAxisAngle(axis, angle);

    // Simple 3D cube vertices projected
    const vertices = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ].map(v => rotateQuaternion(new Vector(v[0], v[1], v[2]).scale(60), q));

    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    renderer.ctx.strokeStyle = '#e74c3c';
    renderer.ctx.lineWidth = 3;
    edges.forEach(([a,b]) => {
      renderer.ctx.beginPath();
      const sa = renderer.toScreen(project3D(vertices[a]));
      const sb = renderer.toScreen(project3D(vertices[b]));
      renderer.ctx.moveTo(sa.x, sa.y);
      renderer.ctx.lineTo(sb.x, sb.y);
      renderer.ctx.stroke();
    });

    drawInfo(`Quaternion rotation: q = cos(θ/2) + sin(θ/2)(${axis.x.toFixed(2)}i + ${axis.y.toFixed(2)}j + ${axis.z.toFixed(2)}k)`);
  }
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function drawGridAndBasis(transformFn) {
  const step = 40;
  renderer.ctx.strokeStyle = '#ddd';
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      const v = new Vector(i * step, j * step);
      const tv = transformFn(v);
      if (tv.magnitude() > 10000) continue;
      renderer.ctx.beginPath();
      const s1 = renderer.toScreen(v);
      const s2 = renderer.toScreen(tv);
      renderer.ctx.moveTo(s1.x, s1.y);
      renderer.ctx.lineTo(s2.x, s2.y);
      renderer.ctx.stroke();
    }
  }
}

function project3D(v) {
  const dist = 300;
  const scale = dist / (dist + v.z);
  return new Vector(v.x * scale, v.y * scale);
}

function rotateQuaternion(v, q) {
  const qv = { w: 0, x: v.x, y: v.y, z: v.z };
  const conj = { w: q.w, x: -q.x, y: -q.y, z: -q.z };
  const a = mul(q, qv);
  const b = mul(a, conj);
  return new Vector(b.x, b.y, b.z);
}

function quaternionFromAxisAngle(axis, angle) {
  const half = angle / 2;
  return {
    w: Math.cos(half),
    x: axis.x * Math.sin(half),
    y: axis.y * Math.sin(half),
    z: axis.z * Math.sin(half)
  };
}

function mul(a, b) {
  return {
    w: a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
    x: a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
    y: a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
    z: a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w
  };
}

function drawInfo(text, y = 40) {
  renderer.ctx.fillStyle = '#333';
  renderer.ctx.font = 'bold 16px Arial';
  renderer.ctx.fillText(text, 20, y);
}

// Mouse tracking
const handleMouse = (e) => {
  if (!renderer) return;
  const rect = canvas.value.getBoundingClientRect();
  const math = renderer.toMath(e.clientX - rect.left, e.clientY - rect.top);
  mousePos.value = new Vector(math.x, math.y);
};

// ──────────────────────────────────────────────────────────────
// Lifecycle
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
    canvas.value.addEventListener('mousemove', handleMouse);
    animate();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  if (canvas.value) canvas.value.removeEventListener('mousemove', handleMouse);
});

watch(mode, render);
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Beauty of Mathematics IV</h1>
      <p>Complex numbers · Fourier · Möbius · Quaternions · Vector Fields</p>
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
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  color: white;
}

.header h1 { font-size: 2.5rem; margin: 0; background: linear-gradient(90deg, #ff9a9e, #fad0c4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header p { opacity: 0.9; font-size: 1.1rem; }

.button-group { gap: 1rem; flex-wrap: wrap; justify-content: center; }
.mode-button {
  padding: 1rem 1.8rem;
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  color: white;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}
.mode-button:hover { background: rgba(255,255,255,0.2); transform: translateY(-4px); }
.mode-button.active { background: white; color: #1e3c72; transform: scale(1.15); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

.canvas {
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  background: white;
  cursor: crosshair;
}

.description-box {
  background: rgba(255,255,255,0.97);
  /* color: #1e3c72; */
  color: black;
  padding: 2rem;
  border-radius: 20px;
  max-width: 700px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  font-size: 1.05rem;
  line-height: 1.7;


  h3 { color: black; }
}
</style>
