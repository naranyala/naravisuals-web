<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref(null);
let animationId = null;
let renderer = null;

onMounted(() => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  // Axes for reference
  const axes = new THREE.AxesHelper(8);
  scene.add(axes);

  // === GENERATE HOPF FIBERS ===
  const fibers = [];
  const numLatitudes = 8;   // horizontal rings
  const numMeridians = 12;  // vertical slices
  const pointsPerFiber = 120;

  // Helper: stereographic projection from S³ → ℝ³
  function hopfFiber(theta, phi) {
    // Base point on S²: (sinθ cosφ, sinθ sinφ, cosθ)
    // Corresponding fiber in S³: (α, β) = (cos(θ/2), e^{iφ} sin(θ/2))
    const alpha = Math.cos(theta / 2);
    const betaMag = Math.sin(theta / 2);
    
    const points = [];
    for (let i = 0; i <= pointsPerFiber; i++) {
      const eta = (i / pointsPerFiber) * Math.PI * 2;
      
      // Fiber point in S³: (α, β * e^{iη})
      const betaRe = betaMag * Math.cos(phi + eta);
      const betaIm = betaMag * Math.sin(phi + eta);
      
      // Stereographic projection: (x, y, z) = (2 Re(α·conj(β)), 2 Im(α·conj(β)), |β|² - |α|²) / (1 + |β|²|α|²?) → simplified
      // Standard formula: (2a c + 2b d, 2b c - 2a d, a² + b² - c² - d²) where (a+ib, c+id) ∈ S³
      // But easier: use (α, β) = (a + ib, c + id)
      const a = alpha; // real
      const b = 0;
      const c = betaRe;
      const d = betaIm;
      
      const denom = 1 - d; // projection from (0,0,0,-1)
      if (Math.abs(denom) < 1e-6) continue; // avoid pole
      
      const x = (2 * (a * c + b * d)) / denom;
      const y = (2 * (b * c - a * d)) / denom;
      const z = (a * a + b * b - c * c - d * d) / denom;
      
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }

  // Generate fibers along latitudes
  for (let lat = 0; lat < numLatitudes; lat++) {
    const theta = (lat / (numLatitudes - 1)) * Math.PI; // 0 to π
    const hue = lat / numLatitudes; // color by latitude
    const color = new THREE.Color().setHSL(hue, 0.9, 0.65);

    for (let m = 0; m < numMeridians; m++) {
      const phi = (m / numMeridians) * Math.PI * 2;
      const points = hopfFiber(theta, phi);
      
      if (points.length < 2) continue;
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: color.getHex(),
        transparent: true,
        opacity: 0.85
      });
      const fiber = new THREE.Line(geometry, material);
      scene.add(fiber);
      fibers.push(fiber);
    }
  }

  // Animation
  let time = 0;
  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.005;

    // Rotate entire fibration
    fibers.forEach(fiber => {
      fiber.rotation.x = time * 0.2;
      fiber.rotation.y = time * 0.3;
    });

    // Camera orbits slowly
    const radius = 35;
    camera.position.x = radius * Math.cos(time * 0.2);
    camera.position.z = radius * Math.sin(time * 0.2);
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
    <h2 class="title">Hopf Fibration</h2>
    <div ref="container" class="container"></div>
    <p class="description">
      Fibers of the Hopf map S³ → S² • Each circle is the preimage of a point on the 2-sphere • Every pair of circles is linked exactly once
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #000022, #000000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.title {
  color: #818cf8;
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: bold;
  text-shadow: 0 0 12px rgba(129, 140, 248, 0.5);
}

.container {
  width: 900px;
  height: 650px;
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(100, 100, 255, 0.2);
  overflow: hidden;
}

.description {
  color: #a0aec0;
  margin-top: 22px;
  font-size: 14px;
  text-align: center;
  max-width: 850px;
  padding: 0 20px;
  line-height: 1.6;
}
</style>
