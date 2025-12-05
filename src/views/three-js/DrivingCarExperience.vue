<template>
  <div ref="mountRef" style="width: 100vw; height: 100vh; margin: 0; overflow: hidden;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// If you installed Three.js via npm, use:
import * as THREE from 'three'
// Otherwise, we assume Three is available globally (via CDN in index.html)

const mountRef = ref(null)

let scene, camera, renderer, car
const keys = {}
let speed = 0
let turnSpeed = 0

// Constants
const maxSpeed = 0.2
const acceleration = 0.01
const deceleration = 0.005
const maxTurnSpeed = 0.05
const turnAcceleration = 0.01

let animationId = null

function init() {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  mountRef.value.appendChild(renderer.domElement)

  // **GRID HELPER** — makes movement visible!
  const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222)
  scene.add(gridHelper)

  // Ground (optional, but keeps shadows if you add them later)
  const groundGeo = new THREE.PlaneGeometry(100, 100)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333, wireframe: true, transparent: true, opacity: 0 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = Math.PI / 2
  scene.add(ground)

  // Car
  const carGeo = new THREE.BoxGeometry(1, 0.5, 2)
  const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  car = new THREE.Mesh(carGeo, carMat)
  scene.add(car)

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1.2)
  light.position.set(10, 15, 10)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0x606060))

  // Event listeners
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('resize', handleResize)

  // Start animation
  animate()
}

function handleKeyDown(e) {
  // Map WASD (case-insensitive)
  if (e.key.toLowerCase() === 'w') keys.forward = true
  if (e.key.toLowerCase() === 's') keys.backward = true
  if (e.key.toLowerCase() === 'a') keys.left = true
  if (e.key.toLowerCase() === 'd') keys.right = true
}

function handleKeyUp(e) {
  if (e.key.toLowerCase() === 'w') keys.forward = false
  if (e.key.toLowerCase() === 's') keys.backward = false
  if (e.key.toLowerCase() === 'a') keys.left = false
  if (e.key.toLowerCase() === 'd') keys.right = false
}

function handleResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  // **WASD Driving Logic**
  if (keys.forward) {
    speed = Math.min(speed + acceleration, maxSpeed)
  } else if (keys.backward) {
    speed = Math.max(speed - acceleration, -maxSpeed / 2)
  } else {
    // Natural deceleration
    if (speed > 0) speed = Math.max(0, speed - deceleration)
    if (speed < 0) speed = Math.min(0, speed + deceleration)
  }

  // Turning
  if (keys.left) {
    turnSpeed = Math.min(turnSpeed + turnAcceleration, maxTurnSpeed)
  } else if (keys.right) {
    turnSpeed = Math.max(turnSpeed - turnAcceleration, -maxTurnSpeed)
  } else {
    // Dampen turning when no input
    if (turnSpeed > 0) turnSpeed = Math.max(0, turnSpeed - turnAcceleration / 2)
    if (turnSpeed < 0) turnSpeed = Math.min(0, turnSpeed + turnAcceleration / 2)
  }

  // Apply rotation & movement
  car.rotation.y += turnSpeed
  car.position.x -= Math.sin(car.rotation.y) * speed
  car.position.z -= Math.cos(car.rotation.y) * speed

  // Third-person camera
  const cameraOffset = new THREE.Vector3(0, 2.5, 6) // slightly higher/back for better view
  camera.position.copy(car.position)
  camera.position.add(cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y))
  camera.lookAt(car.position)

  renderer.render(scene, camera)
}

function cleanup() {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
  if (renderer && mountRef.value?.contains(renderer.domElement)) {
    renderer.dispose()
    mountRef.value.removeChild(renderer.domElement)
  }
}

onMounted(() => {
  if (typeof THREE === 'undefined') {
    console.error('THREE is not available. Please include Three.js via CDN or npm.')
    return
  }
  init()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 0;
}
</style>
