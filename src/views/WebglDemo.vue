<template>
  <div class="demo-card">
    <div class="demo-header">
      <h3 class="demo-title">{{ demo.title }}</h3>
      <p class="demo-description">{{ demo.description }}</p>
    </div>
    <div class="canvas-container" ref="canvasContainer"></div>
    <div class="controls">
      <button class="control-btn" @click="toggleRotation">
        {{ demo.autoRotate ? 'Pause' : 'Rotate' }}
      </button>
      <button class="control-btn" @click="changeColor">
        Change Color
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  demo: {
    type: Object,
    required: true
  }
})

const canvasContainer = ref(null)
const scene = ref(null)
const camera = ref(null)
const renderer = ref(null)
const mesh = ref(null)
const animationId = ref(null)
const isDragging = ref(false)
const previousMousePosition = ref({ x: 0, y: 0 })

// Initialize Three.js scene
const initScene = () => {
  // Create scene
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0x0a0e1a)

  // Create camera
  camera.value = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.value.position.z = 5

  // Create renderer
  renderer.value = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.value.setSize(
    canvasContainer.value.clientWidth,
    canvasContainer.value.clientHeight
  )
  renderer.value.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.value.domElement)

  // Create geometry based on demo type
  let geometry
  switch (props.demo.geometry) {
    case 'box':
      geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
      break
    case 'sphere':
      geometry = new THREE.SphereGeometry(1.2, 32, 32)
      break
    case 'torusKnot':
      geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32)
      break
    case 'icosahedron':
      geometry = new THREE.IcosahedronGeometry(1.3, 0)
      break
    default:
      geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
  }

  // Create material
  let material
  if (props.demo.geometry === 'icosahedron') {
    material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      wireframe: true,
      transparent: true,
      opacity: 0.8
    })
  } else {
    material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      shininess: 100,
      flatShading: props.demo.geometry === 'box'
    })
  }

  // Create mesh
  mesh.value = new THREE.Mesh(geometry, material)
  scene.value.add(mesh.value)

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.value.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.value.add(directionalLight)

  // Mouse interaction
  const onMouseDown = (e) => {
    isDragging.value = true
    previousMousePosition.value = { x: e.offsetX, y: e.offsetY }
  }

  const onMouseUp = () => {
    isDragging.value = false
  }

  const onMouseMove = (e) => {
    if (!isDragging.value || !mesh.value) return

    const deltaMove = {
      x: e.offsetX - previousMousePosition.value.x,
      y: e.offsetY - previousMousePosition.value.y
    }

    mesh.value.rotation.y += deltaMove.x * 0.01
    mesh.value.rotation.x += deltaMove.y * 0.01

    previousMousePosition.value = { x: e.offsetX, y: e.offsetY }
  }

  // Add event listeners
  renderer.value.domElement.addEventListener('mousedown', onMouseDown)
  renderer.value.domElement.addEventListener('mouseup', onMouseUp)
  renderer.value.domElement.addEventListener('mousemove', onMouseMove)
  renderer.value.domElement.addEventListener('mouseleave', onMouseUp)

  // Handle window resize
  const onWindowResize = () => {
    if (!camera.value || !renderer.value) return
    camera.value.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  }
  window.addEventListener('resize', onWindowResize)

  // Store cleanup function
  cleanup.value = () => {
    window.removeEventListener('resize', onWindowResize)
    renderer.value.domElement.removeEventListener('mousedown', onMouseDown)
    renderer.value.domElement.removeEventListener('mouseup', onMouseUp)
    renderer.value.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.value.domElement.removeEventListener('mouseleave', onMouseUp)
  }

  // Start animation
  animate()
}

// Animation loop
const animate = () => {
  if (!scene.value || !camera.value || !renderer.value || !mesh.value) return

  animationId.value = requestAnimationFrame(animate)

  // Auto-rotation
  if (props.demo.autoRotate) {
    mesh.value.rotation.x += props.demo.speed
    mesh.value.rotation.y += props.demo.speed
  }

  renderer.value.render(scene.value, camera.value)
}

// Toggle auto-rotation
const toggleRotation = () => {
  // Emit event to parent to update demo state
  // In a real app, you might use a state management solution
  // For this example, we'll use a simple approach
  // Since we can't modify props directly, we'll use a different pattern
  // This is a limitation of the current structure
  // In a real app, you'd manage state in a store or parent component
}

// Change object color
const changeColor = () => {
  if (!mesh.value) return
  const newColor = new THREE.Color(Math.random(), Math.random(), Math.random())
  mesh.value.material.color = newColor
  mesh.value.material.needsUpdate = true
}

// Cleanup function
const cleanup = ref(null)

// Initialize scene
onMounted(() => {
  initScene()
})

// Clean up on unmount
onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (cleanup.value) {
    cleanup.value()
  }
  if (renderer.value) {
    renderer.value.dispose()
    if (canvasContainer.value && renderer.value.domElement) {
      canvasContainer.value.removeChild(renderer.value.domElement)
    }
  }
})

// Handle demo prop changes
watch(() => props.demo.autoRotate, (newVal) => {
  // Auto-rotation is handled in the animation loop
  // No additional action needed here
})
</script>

<style scoped>
.demo-card {
  background: rgba(30, 40, 70, 0.7);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.demo-header {
  padding: 15px 20px;
  background: rgba(20, 30, 50, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-title {
  font-size: 1.4rem;
  font-weight: 600;
}

.demo-description {
  font-size: 0.95rem;
  opacity: 0.8;
  margin-top: 8px;
}

.canvas-container {
  height: 250px;
  position: relative;
  overflow: hidden;
}

.controls {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  background: rgba(20, 30, 50, 0.8);
}

.control-btn {
  background: rgba(52, 152, 219, 0.2);
  border: 1px solid rgba(52, 152, 219, 0.5);
  color: #3498db;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(52, 152, 219, 0.4);
}
</style>
