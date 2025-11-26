<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref(null);
let animationId = null;
let renderer = null;

onMounted(() => {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010211);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambient);
  const pointLight = new THREE.PointLight(0xffffff, 1, 300);
  pointLight.position.set(20, 30, 20);
  scene.add(pointLight);

  // Axes (subtle)
  const axes = new THREE.AxesHelper(15);
  scene.add(axes);

  // === LORENZ ATTRACTOR SETUP ===
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;

  // Initial condition (slightly off origin)
  let x = 0.1;
  let y = 0;
  let z = 0;

  // Fixed points (for ρ > 1)
  const fpMag = Math.sqrt(beta * (rho - 1));
  const fixedPoint1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff4400 })
  );
  fixedPoint1.position.set(fpMag, fpMag, rho - 1);
  scene.add(fixedPoint1);

  const fixedPoint2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff4400 })
  );
  fixedPoint2.position.set(-fpMag, -fpMag, rho - 1);
  scene.add(fixedPoint2);

  // Trajectory trail
  const maxLength = 8000; // max points to store
  const positions = new Float32Array(maxLength * 3);
  const colors = new Float32Array(maxLength * 3);
  let pointCount = 0;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.85
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // RK4 integrator
  function lorenz(x, y, z) {
    return {
      dx: sigma * (y - x),
      dy: x * (rho - z) - y,
      dz: x * y - beta * z
    };
  }

  function rk4Step(x, y, z, dt) {
    const k1 = lorenz(x, y, z);
    const k2 = lorenz(x + dt * k1.dx / 2, y + dt * k1.dy / 2, z + dt * k1.dz / 2);
    const k3 = lorenz(x + dt * k2.dx / 2, y + dt * k2.dy / 2, z + dt * k2.dz / 2);
    const k4 = lorenz(x + dt * k3.dx, y + dt * k3.dy, z + dt * k3.dz);

    return {
      x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
      y: y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy),
      z: z + (dt / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz)
    };
  }

  // Animation & integration
  let time = 0;
  const dt = 0.01; // integration step

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    // Integrate 5 steps per frame for smoothness
    for (let i = 0; i < 5; i++) {
      const next = rk4Step(x, y, z, dt);
      x = next.x;
      y = next.y;
      z = next.z;

      // Add to trail
      if (pointCount < maxLength) {
        positions[pointCount * 3] = x;
        positions[pointCount * 3 + 1] = y;
        positions[pointCount * 3 + 2] = z;

        // Color by z (normalize z between -20 and 50)
        const normZ = Math.max(0, Math.min(1, (z + 20) / 70));
        const color = new THREE.Color().setHSL(0.66 * (1 - normZ), 0.9, 0.5); // blue (low) → red (high)
        colors[pointCount * 3] = color.r;
        colors[pointCount * 3 + 1] = color.g;
        colors[pointCount * 3 + 2] = color.b;

        pointCount++;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.setDrawRange(0, pointCount);
      }
    }

    // Rotate camera slowly around attractor
    const camRadius = 60;
    const camHeight = 20;
    camera.position.x = camRadius * Math.cos(time * 0.15);
    camera.position.z = camRadius * Math.sin(time * 0.15);
    camera.position.y = camHeight * Math.sin(time * 0.1);
    camera.lookAt(0, 0, rho - 1); // look at center of attractor

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  const handleResize = () => {
    if (!container.value) return;
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  };
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
});
</script>

<template>
  <div class="wrapper">
    <h2 class="title">Lorenz Attractor • Chaos Theory</h2>
    <div ref="container" class="container"></div>
    <p class="description">
      Solution to the Lorenz system (σ=10, ρ=28, β=8/3) • Trajectory never repeats • Sensitive dependence on initial conditions • Fixed points in orange
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #01031a, #000000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.title {
  color: #f87171;
  font-size: 26px;
  margin-bottom: 16px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.4);
}

.container {
  width: 900px;
  height: 650px;
  border-radius: 12px;
  box-shadow: 0 0 35px rgba(200, 50, 100, 0.2);
  overflow: hidden;
}

.description {
  color: #cbd5e1;
  margin-top: 22px;
  font-size: 14px;
  text-align: center;
  max-width: 850px;
  padding: 0 20px;
  line-height: 1.6;
}
</style>
