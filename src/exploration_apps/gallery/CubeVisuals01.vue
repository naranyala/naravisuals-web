<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref(null);
let animationId = null;
let renderer = null;

onMounted(() => {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(12, 10, 12);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  // Helpers
  const gridHelper = new THREE.GridHelper(16, 16, 0x444444, 0x222222);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Axis Labels
  const createAxisLabel = (text, position, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    ctx.fillStyle = color;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(1.2, 1.2, 1);
    return sprite;
  };

  scene.add(createAxisLabel('X', new THREE.Vector3(11, 0, 0), '#ff0000'));
  scene.add(createAxisLabel('Y', new THREE.Vector3(0, 11, 0), '#00ff00'));
  scene.add(createAxisLabel('Z', new THREE.Vector3(0, 0, 11), '#0000ff'));

  // === VECTOR FIELD ===
  const arrows = [];
  const range = 4; // from -range to +range
  const step = 1.5;
  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    1,
    0xffffff
  );

  // Precompute all arrow positions and directions
  for (let x = -range; x <= range; x += step) {
    for (let y = -range; y <= range; y += step) {
      for (let z = -range; z <= range; z += step) {
        // Skip dense center if needed
        if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z) < 0.1) continue;

        // Gradient of f(x,y,z) = x² + y² - z → [2x, 2y, -1]
        const dx = 2 * x;
        const dy = 2 * y;
        const dz = -1;

        const direction = new THREE.Vector3(dx, dy, dz).normalize();
        const origin = new THREE.Vector3(x, y, z);
        const length = Math.min(1.2, Math.sqrt(dx * dx + dy * dy + dz * dz) * 0.4);

        // Color by z (or magnitude)
        const hue = (z + range) / (2 * range); // 0 to 1
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

        const arrow = new THREE.ArrowHelper(direction, origin, length, color.getHex());
        scene.add(arrow);
        arrows.push({ arrow, origin: new THREE.Vector3(x, y, z) });
      }
    }
  }

  // Center sphere
  const originGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const originMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const origin = new THREE.Mesh(originGeo, originMat);
  scene.add(origin);

  // Animation loop
  let time = 0;
  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.005;

    // Rotate camera slowly
    const radius = 15;
    camera.position.x = radius * Math.cos(time * 0.25);
    camera.position.z = radius * Math.sin(time * 0.25);
    camera.lookAt(0, 0, 0);

    // Optional: gently wiggle arrows (comment out for static field)
    arrows.forEach(({ arrow, origin }) => {
      const t = time + origin.x * 0.3 + origin.y * 0.2;
      const sway = 0.05 * Math.sin(t);
      arrow.setLength(arrow.length, 0.1 + sway, 0.1 + sway * 0.5);
    });

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
    <h2 class="title">3D Gradient Vector Field</h2>
    <div ref="container" class="container"></div>
    <p class="description">
      Gradient of f(x,y,z) = x² + y² − z • Arrows show direction of steepest ascent • Colored by height (Z)
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.title {
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.container {
  width: 800px;
  height: 600px;
  border: 2px solid #444;
}

.description {
  color: #aaa;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  max-width: 800px;
  padding: 0 20px;
}
</style>
