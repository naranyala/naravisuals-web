<script setup>
// import { ref, onMounted, onUnmounted } from 'vue';
// import { createCanvasApp } from './canvas_util.js';
// import { mathPlugin } from './mathPlugin.js';
// import { shapesPlugin } from './shapesPlugin.js';

import { ref, onMounted, onUnmounted, watch } from 'vue'

import { createCanvasApp } from '../../lib/engine/canvas_util.js'
import { shapesPlugin } from '../../lib/engine/shapesPlugin.js'
import { mathPlugin } from '../../lib/engine/mathPlugin.js'


// --- Constants (adjust for simulation speed/scale) ---
const G_CONSTANT = 0.1; // Gravitational constant for the simulation
const SCALE = 20; // Scale factor for rendering orbits
const TIME_STEP = 1; // Simulation time step (lower for higher fidelity)

// --- Canvas Ref ---
const canvasRef = ref(null);
let app = null;

// ======================================================
// 🌌 Orbiting Body Class
// ======================================================

/**
 * Represents a body (Sun or Planet) with mass, position, and velocity.
 */
class OrbitingBody {
  constructor(app, name, mass, radius, color, initialPosition, initialVelocity) {
    this.app = app;
    this.name = name;
    this.mass = mass; // M
    this.radius = radius;
    this.color = color;

    // Vector2 instances for physics calculations
    this.position = app.vec2(initialPosition.x, initialPosition.y); // r
    this.velocity = app.vec2(initialVelocity.x, initialVelocity.y); // v
    this.acceleration = app.vec2(0, 0); // a

    // Visual object for rendering
    this.visual = app.shapes.circle(
      this.position.x * SCALE,
      this.position.y * SCALE,
      this.radius,
      this.color
    );
  }

  /**
   * Calculates gravitational force applied by another body (other) and
   * updates this body's acceleration vector (a = F/m).
   * @param {OrbitingBody} other - The other body.
   */
  applyGravity(other) {
    if (this === other) return;

    // 1. Calculate distance vector (r_vec = r_other - r_this)
    const distanceVec = other.position.sub(this.position);
    const distanceSq = distanceVec.lenSq();
    const distance = Math.sqrt(distanceSq);

    // Avoid division by zero/extreme force at very close proximity
    if (distance < this.radius + other.radius) {
      // Simple repulsion or clamping near collision
      this.acceleration.add$(distanceVec.normalized().mul(-1));
      return;
    }

    // 2. Calculate force magnitude (F = G * (m1 * m2) / r²)
    const forceMagnitude = (G_CONSTANT * this.mass * other.mass) / distanceSq;

    // 3. Calculate force vector (F_vec = F * r_vec_normalized)
    const forceVec = distanceVec.normalized().mul(forceMagnitude);

    // 4. Update acceleration (a_vec = F_vec / m_this)
    this.acceleration.add$(forceVec.div(this.mass));
  }

  /**
   * Updates position and velocity using simple Euler integration.
   * v(t+dt) = v(t) + a(t) * dt
   * r(t+dt) = r(t) + v(t+dt) * dt
   */
  updatePhysics(dt) {
    // Update velocity: v += a * dt
    this.velocity.add$(this.acceleration.mul(dt));

    // Update position: r += v * dt
    this.position.add$(this.velocity.mul(dt));

    // Reset acceleration for next frame's calculation
    this.acceleration.set$(0, 0);
  }

  /**
   * Updates the visual position on the canvas.
   * The canvas coordinates are centered and scaled.
   */
  updateVisual(centerX, centerY) {
    this.visual.x = this.position.x * SCALE + centerX;
    this.visual.y = this.position.y * SCALE + centerY;
  }
}

// ======================================================
// 🚀 Setup and Simulation Logic
// ======================================================

const setupSolarSystem = () => {
  if (!canvasRef.value) return;

  // Initialize the canvas engine
  app = createCanvasApp(canvasRef.value);

  // Load plugins (math and shapes)
  app.use(mathPlugin);
  app.use(shapesPlugin);

  const centerX = app.canvas.width / 2;
  const centerY = app.canvas.height / 2;

  // --- 1. Create the bodies ---
  const sun = new OrbitingBody(
    app, 'Sun',
    1000, 15, '#ffc000', // mass, radius, color
    { x: 0, y: 0 },      // initial position
    { x: 0, y: 0 }       // initial velocity (stationary)
  );

  const earth = new OrbitingBody(
    app, 'Earth',
    1, 5, '#007aff',
    { x: 100, y: 0 },
    { x: 0, y: app.math.SQRT1_2 * 3 } // Calculated velocity for a stable, slightly elliptical orbit
  );

  const mars = new OrbitingBody(
    app, 'Mars',
    0.5, 4, '#ff3b30',
    { x: -150, y: 0 },
    { x: 0, y: -app.math.SQRT1_2 * 2.4 }
  );

  const bodies = [sun, earth, mars];

  // --- 2. Setup the Canvas Grid (from mathPlugin) ---
  app.math.grid({
    step: 50,
    axes: true,
    labels: false,
    subDivisions: 1,
  });

  // --- 3. Define the Main Update Loop ---
  app.update = (dt) => {
    const physicsDt = dt * TIME_STEP / 1000; // Convert ms to s (or scale it)

    // 1. Calculate gravity for every pair of bodies (N-Body Sim)
    for (let i = 0; i < bodies.length; i++) {
      for (let j = 0; j < bodies.length; j++) {
        bodies[i].applyGravity(bodies[j]);
      }
    }

    // 2. Update physics and visuals for each body
    for (const body of bodies) {
      body.updatePhysics(physicsDt);
      body.updateVisual(centerX, centerY);
    }
  };
};

onMounted(() => {
  // Ensure canvas size is set based on the container size
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth;
    canvasRef.value.height = canvasRef.value.offsetHeight;
  }
  setupSolarSystem();
});

onUnmounted(() => {
  if (app) {
    app.stop();
    app = null;
  }
});
</script>

<template>
  <div class="solar-system-container">
    <h2>Planetary Orbit Simulation</h2>
    <p>Using **Vector2** for physics and **CanvasUtil** for rendering.</p>
    <canvas ref="canvasRef" class="simulation-canvas"></canvas>
  </div>
</template>

<style scoped>
.solar-system-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 600px;
  background: #111;
  color: #eee;
  padding: 20px;
}

.simulation-canvas {
  width: 100%;
  height: 100%;
  border: 1px solid #333;
  background: #1a1a2e;
  /* Dark space background */
}
</style>
