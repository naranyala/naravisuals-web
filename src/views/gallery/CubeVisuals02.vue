<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref(null);
let animationId = null;
let renderer = null;

onMounted(() => {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020814); // Dark blue

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 25);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Axes and grid (subtle)
  const axesHelper = new THREE.AxesHelper(8);
  scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
  gridHelper.position.y = -6;
  scene.add(gridHelper);

  // === TORUS KNOT PARAMETERS ===
  const p = 3; // longitudinal wraps
  const q = 5; // meridional wraps (must be coprime with p)
  const R = 6; // major radius (distance from center to tube)
  const r = 2; // minor radius (tube thickness)

  // Create the torus surface (wireframe or transparent)
  const torusGeometry = new THREE.TorusGeometry(R, r, 64, 128);
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a365d,
    transparent: true,
    opacity: 0.15,
    wireframe: false
  });
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);
  scene.add(torus);

  // Create the knot curve
  const curvePoints = [];
  const segments = 400;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = (R + r * Math.cos(q * theta)) * Math.cos(p * theta);
    const y = (R + r * Math.cos(q * theta)) * Math.sin(p * theta);
    const z = r * Math.sin(q * theta);
    curvePoints.push(new THREE.Vector3(x, y, z));
  }

  const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const curveMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 2
  });
  const knotCurve = new THREE.Line(curveGeometry, curveMaterial);
  scene.add(knotCurve);

  // Add a glowing traveling sphere
  const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const traveler = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(traveler);

  // Add small spheres at start/end to show closure
  const startSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  startSphere.position.copy(curvePoints[0]);
  scene.add(startSphere);

  // Animation
  let time = 0;
  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    // Rotate entire scene slowly
    torus.rotation.y = time * 0.1;
    knotCurve.rotation.y = time * 0.1;

    // Move traveler along the curve
    const progress = (time * 0.3) % 1;
    const index = Math.floor(progress * (curvePoints.length - 1));
    const nextIndex = (index + 1) % curvePoints.length;
    const t = (progress * (curvePoints.length - 1)) % 1;
    traveler.position.lerpVectors(curvePoints[index], curvePoints[nextIndex], t);

    // Pulsing glow effect (via scale)
    const pulse = 1 + 0.2 * Math.sin(time * 4);
    traveler.scale.setScalar(pulse);

    // Camera orbits gently
    const camRadius = 25;
    camera.position.x = camRadius * Math.cos(time * 0.15);
    camera.position.z = camRadius * Math.sin(time * 0.15);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize
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
    <h2 class="title">Torus Knot (p=3, q=5)</h2>
    <div ref="container" class="container"></div>
    <p class="description">
      A (3,5) torus knot on a torus • p and q coprime → forms a single closed loop • Traveling point shows path continuity
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #0c1427, #020814);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.title {
  color: #60a5fa;
  font-size: 26px;
  margin-bottom: 16px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
}

.container {
  width: 850px;
  height: 600px;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.1);
  overflow: hidden;
}

.description {
  color: #94a3b8;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  max-width: 800px;
  padding: 0 20px;
  line-height: 1.5;
}
</style>
