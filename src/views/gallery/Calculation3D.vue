<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import * as THREE from 'three';
import Vector3D from '../../utilities/Vector3D.js';

const container = ref(null);
let animationId = null;

onMounted(() => {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    23,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  
  // Initial camera position
  camera.position.set(3, 3, 3);
  camera.lookAt(0.5, 0.5, 0.5); // Look at cube center
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);
  
  // Cube with transparent fill
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x0077ff, 
    transparent: true,
    opacity: 0.3,
    wireframe: false
  });
  const cube = new THREE.Mesh(geometry, material);
  
  // Position cube so all corners are positive
  // For a 1x1x1 cube, center at (0.5, 0.5, 0.5) means corners range from (0,0,0) to (1,1,1)
  cube.position.set(0.5, 0.5, 0.5);
  scene.add(cube);
  
  // Add wireframe edges on top for crisp lines
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0077ff });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  cube.add(wireframe);
  
  // Axes helper - showing coordinate system origin at (0,0,0)
  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);
  
  // Animation parameters
  let time = 0;
  const speed = 0.5;
  const amplitude = 3;
  
  // Animation loop
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    time += 0.01 * speed;
    
    const xOffset = Math.sin(time) * amplitude;
    
    camera.position.x = 3 + xOffset;
    camera.position.y = 3;
    camera.position.z = 3;
    
    camera.lookAt(0.5, 0.5, 0.5); // Keep looking at cube center
    
    renderer.render(scene, camera);
  }
  
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<template>
  <div>
    <h2>Animated Cube — Left-Right Camera Movement</h2>
    <div ref="container" style="width: 400px; height: 400px; border: 1px solid black;"></div>
  </div>
</template>
