<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import Vector3D from '../../utilities/Vector3D.js';

const container = ref(null);

onMounted(() => {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // white background

  // Camera
  const camera = new THREE.PerspectiveCamera(
    23,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );

  // Position camera at a top-corner view (diagonal between X/Y/Z)
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  // Cube geometry + material
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Axes helper (X=red, Y=green, Z=blue)
  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);

  // Example: use Vector3D to offset cube position if desired
  const offset = new Vector3D(0, 0, 0);
  cube.position.set(offset.x, offset.y, offset.z);

  // Render once (static view)
  renderer.render(scene, camera);
});
</script>

<template>
  <div>
    <h2>Static Cube — Top-Corner View</h2>
    <div ref="container" style="width: 400px; height: 400px; border: 1px solid black;"></div>
  </div>
</template>

