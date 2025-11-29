<template>
  <div class="container">
    <header>
      <h1>WebGL Gallery</h1>
      <p class="subtitle">Interactive 3D demos built with Vue 3 and Three.js</p>
    </header>

    <div class="gallery">
      <WebglDemo v-for="demo in demos" :key="demo.id" :demo="demo" />
    </div>

    <div class="instructions">
      <h2>How to Interact</h2>
      <p>• Click and drag to rotate the 3D objects</p>
      <p>• Use the controls to toggle auto-rotation or change colors</p>
      <p>• Each demo showcases different Three.js capabilities</p>
    </div>

    <footer>
      <p>WebGL Gallery | Vue 3 + Three.js | Built with ❤️</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WebglDemo from './WebglDemo.vue'

const demos = ref([
  {
    id: 1,
    title: "Rotating Cube",
    description: "A simple rotating cube with dynamic colors",
    geometry: "box",
    autoRotate: true,
    speed: 0.01
  },
  {
    id: 2,
    title: "Spinning Sphere",
    description: "A textured sphere with smooth rotation",
    geometry: "sphere",
    autoRotate: true,
    speed: 0.005
  },
  {
    id: 3,
    title: "Torus Knot",
    description: "Complex torus knot with vibrant material",
    geometry: "torusKnot",
    autoRotate: true,
    speed: 0.008
  },
  {
    id: 4,
    title: "Icosahedron",
    description: "Geometric icosahedron with wireframe overlay",
    geometry: "icosahedron",
    autoRotate: false,
    speed: 0.007
  }
])
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #2c3e50);
  color: #ecf0f1;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

header {
  text-align: center;
  padding: 30px 0;
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.instructions {
  margin-top: 30px;
  padding: 20px;
  background: rgba(30, 40, 70, 0.6);
  border-radius: 15px;
  text-align: center;
  max-width: 800px;
  margin: 30px auto;
}

.instructions h2 {
  margin-bottom: 15px;
  color: #3498db;
}

footer {
  text-align: center;
  padding: 30px 0 20px;
  opacity: 0.7;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .gallery {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 2.2rem;
  }
}
</style>
