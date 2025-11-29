<template>
  <div class="viewer-container">
    <div class="controls">
      <label>
        Shape:
        <select v-model="selectedShapeType">
          <option v-for="type in Object.values(Shape3DType)" :key="type" :value="type">
            {{ type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() }}
          </option>
        </select>
      </label>
      <div v-if="currentShape" class="metrics">
        <p><strong>Volume:</strong> {{ currentShape.volume().toFixed(2) }}</p>
        <p><strong>Surface Area:</strong> {{ currentShape.surfaceArea().toFixed(2) }}</p>
        <p><strong>Point inside (0,0,0)?</strong> {{ isPointInside ? 'Yes' : 'No' }}</p>
      </div>
    </div>
    <div ref="canvasContainer" class="canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Shape3D, Point3D, Shape3DType } from '../../utilities/shapes3d.js'

// ---- Reactive state ----
const selectedShapeType = ref(Shape3DType.CUBE)
const currentShape = ref(null)
const isPointInside = ref(false)

// ---- Three.js refs ----
const canvasContainer = ref(null)
let scene, camera, renderer, controls, mesh = null

// ---- Test point for inside check ----
const testPoint = new Point3D(0, 0, 0)

// ---- Shape factory using your library ----
const createShape = (type) => {
  const center = new Point3D(0, 0, 0)
  switch (type) {
    case Shape3DType.SPHERE:
      return Shape3D.sphere(center, 1.5)
    case Shape3DType.CUBE:
      return Shape3D.cube(center, 2, 2, 2)
    case Shape3DType.CYLINDER:
      return Shape3D.cylinder(new Point3D(0, -1, 0), 1, 2)
    case Shape3DType.CONE:
      return Shape3D.cone(new Point3D(0, -1, 0), 1, 2)
    case Shape3DType.PYRAMID:
      return Shape3D.pyramid(center, 2, 2, 2)
    case Shape3DType.TETRAHEDRON:
      return Shape3D.tetrahedron(
        new Point3D(1, 1, 1),
        new Point3D(-1, -1, 1),
        new Point3D(-1, 1, -1),
        new Point3D(1, -1, -1)
      )
    case Shape3DType.POINT:
      return Shape3D.point(new Point3D(0, 0, 0))
    default:
      return Shape3D.cube(center, 1, 1, 1)
  }
}

// ---- Convert Shape3D to Three.js geometry ----
const shapeToThreeGeometry = (shape) => {
  const { type, data } = shape
  let geometry

  switch (type) {
    case Shape3DType.SPHERE:
      geometry = new THREE.SphereGeometry(data.radius, 32, 32)
      geometry.translate(data.center.x, data.center.y, data.center.z)
      break
    case Shape3DType.CUBE:
      geometry = new THREE.BoxGeometry(data.width, data.height, data.depth)
      geometry.translate(data.center.x, data.center.y, data.center.z)
      break
    case Shape3DType.CYLINDER:
      geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32)
      geometry.translate(data.baseCenter.x, data.baseCenter.y + data.height / 2, data.baseCenter.z)
      break
    case Shape3DType.CONE:
      geometry = new THREE.ConeGeometry(data.radius, data.height, 32)
      geometry.translate(data.baseCenter.x, data.baseCenter.y + data.height / 2, data.baseCenter.z)
      break
    case Shape3DType.PYRAMID:
      geometry = new THREE.ConeGeometry(Math.min(data.baseWidth, data.baseDepth) / 2, data.height, 4)
      geometry.translate(data.baseCenter.x, data.baseCenter.y + data.height / 2, data.baseCenter.z)
      break
    case Shape3DType.TETRAHEDRON:
      const vertices = [
        data.a.x, data.a.y, data.a.z,
        data.b.x, data.b.y, data.b.z,
        data.c.x, data.c.y, data.c.z,
        data.d.x, data.d.y, data.d.z
      ]
      const indices = [0, 1, 2, 0, 1, 3, 0, 2, 3, 1, 2, 3]
      geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      break
    case Shape3DType.POINT:
      geometry = new THREE.SphereGeometry(0.05, 8, 8)
      geometry.translate(data.x, data.y, data.z)
      break
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1)
  }
  return geometry
}

// ---- Initialize Three.js scene with OrbitControls ----
const initThree = () => {
  const el = canvasContainer.value
  if (!el) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000)
  camera.position.set(0, 0, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)

  // Lights
  scene.add(new THREE.AmbientLight(0x606060))
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // smooth camera movement
  controls.dampingFactor = 0.05

  // Initial render
  renderer.render(scene, camera)
}

// ---- Render loop (no auto-rotation) ----
let animationId = null
const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls.update() // required for damping
  renderer.render(scene, camera)
}

// ---- Update shape in scene ----
const updateScene = () => {
  if (mesh) scene.remove(mesh)

  currentShape.value = createShape(selectedShapeType.value)
  isPointInside.value = currentShape.value.isPointInside(testPoint)

  const geometry = shapeToThreeGeometry(currentShape.value)
  const material = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, shininess: 80 })
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

// ---- Lifecycle ----
onMounted(() => {
  initThree()
  updateScene()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    if (canvasContainer.value && renderer.domElement.parentNode === canvasContainer.value) {
      canvasContainer.value.removeChild(renderer.domElement)
    }
  }
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

watch(selectedShapeType, () => {
  updateScene()
})
</script>

<style scoped>
.viewer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.controls {
  padding: 1rem;
  border: 1px solid white;
  margin: 0 20px;
  /* background: #fafafa; */
  background: black;
  border-bottom: 1px solid #ddd;
  z-index: 10;
}
.metrics {
  margin-top: 0.75rem;
  font-size: 0.95rem;
}
.canvas {
  flex: 1;
  margin: 0 auto;
  background: #f9f9f9;
  width: 688px;
  height: 50px;
}
</style>
