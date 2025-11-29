<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

// Constants
const BALL_COUNT = 30 // Reduced for better performance
const BALL_RADIUS = 0.5
const GRAVITY = -20 // Stronger gravity for faster movement
const DAMPING = 0.85
const FLOOR_Y = -10
const FLOOR_SIZE = 25 // Slightly smaller arena
const WALL_SIZE = 25
const WALL_THICKNESS = 1
const INITIAL_HEIGHT = 15

// References
const sceneContainer = ref(null)
let scene, camera, renderer
let balls = []
let animationId = null
let clock = new THREE.Clock() // Use Three.js clock for proper delta time

// Initialize scene
const initScene = () => {
  // Create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1f3a)
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    60, // Reduced FOV for better performance
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    500 // Reduced far plane
  )
  camera.position.set(0, 8, 20)
  
  // Create renderer with performance optimizations
  renderer = new THREE.WebGLRenderer({ 
    antialias: false, // Disabled for performance
    powerPreference: "high-performance"
  })
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)) // Limit pixel ratio
  renderer.shadowMap.enabled = false // Disable shadows for performance
  sceneContainer.value.appendChild(renderer.domElement)
  
  // Simplified lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(10, 20, 10)
  scene.add(directionalLight)
  
  // Create floor with simpler geometry
  const floorGeometry = new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE, 10, 10) // Reduced segments
  const floorMaterial = new THREE.MeshLambertMaterial({ // Simpler material
    color: 0x3a3a7a
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  scene.add(floor)
  
  // Create walls with simpler materials
  const wallMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x2a2a5a
  })
  
  const walls = [
    { position: [-FLOOR_SIZE/2, WALL_SIZE/2 - 10, 0], size: [WALL_THICKNESS, WALL_SIZE, FLOOR_SIZE] }, // left
    { position: [FLOOR_SIZE/2, WALL_SIZE/2 - 10, 0], size: [WALL_THICKNESS, WALL_SIZE, FLOOR_SIZE] }, // right
    { position: [0, WALL_SIZE/2 - 10, -FLOOR_SIZE/2], size: [FLOOR_SIZE, WALL_SIZE, WALL_THICKNESS] }, // back
  ]
  
  walls.forEach(wallConfig => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(...wallConfig.size, 5, 5, 5), // Reduced segments
      wallMaterial
    )
    wall.position.set(...wallConfig.position)
    scene.add(wall)
  })
  
  // Create balls
  createBalls()
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize)
}

// Create bouncing balls with optimizations
const createBalls = () => {
  // Shared geometry for all balls (important optimization)
  const geometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 12) // Reduced segments
  
  for (let i = 0; i < BALL_COUNT; i++) {
    const hue = i / BALL_COUNT
    const color = new THREE.Color().setHSL(hue, 0.9, 0.6)
    
    const material = new THREE.MeshLambertMaterial({ // Simpler material
      color
    })
    
    const ball = new THREE.Mesh(geometry, material)
    
    // Position balls at the top
    ball.position.set(
      (Math.random() - 0.5) * (FLOOR_SIZE - BALL_RADIUS * 3),
      INITIAL_HEIGHT + Math.random() * 3,
      (Math.random() - 0.5) * (FLOOR_SIZE - BALL_RADIUS * 3)
    )
    
    // Start with zero velocity - just drop straight down
    ball.userData = {
      velocity: new THREE.Vector3(0, 0, 0),
      color: color
    }
    
    scene.add(ball)
    balls.push(ball)
  }
}

// Optimized animation loop
const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const deltaTime = Math.min(clock.getDelta(), 0.1) // Cap delta time to prevent large jumps
  
  // Update ball positions
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i]
    const velocity = ball.userData.velocity
    
    // Apply gravity
    velocity.y += GRAVITY * deltaTime
    
    // Update position
    ball.position.x += velocity.x * deltaTime
    ball.position.y += velocity.y * deltaTime
    ball.position.z += velocity.z * deltaTime
    
    // Floor collision
    if (ball.position.y - BALL_RADIUS <= FLOOR_Y) {
      ball.position.y = FLOOR_Y + BALL_RADIUS
      velocity.y = -velocity.y * DAMPING
      velocity.x *= 0.95
      velocity.z *= 0.95
    }
    
    // Wall collisions
    const halfSize = FLOOR_SIZE / 2 - BALL_RADIUS
    
    if (Math.abs(ball.position.x) >= halfSize) {
      ball.position.x = Math.sign(ball.position.x) * halfSize
      velocity.x = -velocity.x * DAMPING
    }
    
    if (Math.abs(ball.position.z) >= halfSize) {
      ball.position.z = Math.sign(ball.position.z) * halfSize
      velocity.z = -velocity.z * DAMPING
    }
    
    // Simple rotation based on velocity
    ball.rotation.x += velocity.y * deltaTime * 2
    ball.rotation.z += velocity.x * deltaTime * 2
  }
  
  // Occasional camera movement (not every frame)
  if (Math.random() < 0.02) {
    camera.position.x = (Math.random() - 0.5) * 3
    camera.position.z = 18 + (Math.random() - 0.5) * 2
    camera.lookAt(0, 0, 0)
  }
  
  renderer.render(scene, camera)
}

// Handle window resize
const onWindowResize = () => {
  if (!sceneContainer.value) return
  
  camera.aspect = sceneContainer.value.clientWidth / sceneContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight)
}

// Lifecycle hooks
onMounted(() => {
  initScene()
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
  }
  
  // Clean up
  balls.forEach(ball => {
    ball.material.dispose()
  })
  balls = []
})
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #0f1f3a;
}
</style>
