
<script>
import { ref, nextTick, onUnmounted } from "vue"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default {
  name: "App",
  setup() {
    const models = ref([
  {
    "id": 1,
    "name": "Damaged Helmet",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    "description": "PBR reference king, 2.1 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 2,
    "name": "Fox (Running)",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Fox/glTF-Binary/Fox.glb",
    "description": "Fully rigged + skinned animation, 3.8 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 3,
    "name": "Water Bottle",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/WaterBottle/glTF-Binary/WaterBottle.glb",
    "description": "Transmission + clearcoat test, 1.5 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 4,
    "name": "Boom Box",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/BoomBox/glTF-Binary/BoomBox.glb",
    "description": "Emissive + PBR retro vibe, 800 KB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 5,
    "name": "Sponza",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Sponza/glTF/Sponza.gltf",
    "description": "Classic scene for IBL testing, 4.2 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 6,
    "name": "Lantern",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Lantern/glTF-Binary/Lantern.glb",
    "description": "Emissive + transmission glass, 1.9 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 7,
    "name": "Flight Helmet",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/FlightHelmet/glTF/FlightHelmet.gltf",
    "description": "Ultra-detailed PBR helmet, 4.8 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 8,
    "name": "Avocado",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Avocado/glTF-Binary/Avocado.glb",
    "description": "Cutest PBR fruit ever, 220 KB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 9,
    "name": "Flamingo",
    "url": "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Flamingo.glb",
    "description": "Animated pink boi, loops perfectly",
    "source": "three.js",
    "error": false
  },
  {
    "id": 10,
    "name": "Horse",
    "url": "https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Horse.glb",
    "description": "Galloping animation, 1.1 MB",
    "source": "three.js",
    "error": false
  },
  {
    "id": 11,
    "name": "RobotExpressive",
    "url": "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/RobotExpressive.glb",
    "description": "Full facial + body rig, 2.9 MB",
    "source": "three.js",
    "error": false
  },
  {
    "id": 12,
    "name": "BrainStem",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/BrainStem/glTF-Binary/BrainStem.glb",
    "description": "Anatomy PBR model, 1.3 MB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 13,
    "name": "Suzanne (Monkey)",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Suzanne/glTF-Binary/Suzanne.glb",
    "description": "Blender mascot, 280 KB",
    "source": "Khronos Group",
    "error": false
  },
  {
    "id": 14,
    "name": "Cesium Milk Truck",
    "url": "https://cdn.jsdelivr.net/gh/CesiumGS/glTF-Sample-Models@master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb",
    "description": "Classic animated truck, 2.5 MB",
    "source": "CesiumGS",
    "error": false
  },
  {
    "id": 15,
    "name": "Gearbox Assay",
    "url": "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/GearboxAssy/glTF-Binary/GearboxAssy.glb",
    "description": "Mechanical cutaway, 3.7 MB",
    "source": "Khronos Group",
    "error": false
  }

    ])

    const isLightboxOpen = ref(false)
    const isModelLoading = ref(false)
    const selectedModel = ref(null)
    const lightboxCanvasRef = ref(null)
    
    // Store Three.js instances for cleanup
    let scene = null
    let renderer = null
    let camera = null
    let controls = null
    let animationFrameId = null

    const viewModel = async (model) => {
      selectedModel.value = model
      isLightboxOpen.value = true
      isModelLoading.value = true // Show spinner immediately
      
      // Wait for canvas to be rendered
      await nextTick()
      
      if (!lightboxCanvasRef.value) return
      
      initLightboxViewer(lightboxCanvasRef.value, model)
    }

    const closeLightbox = () => {
      isLightboxOpen.value = false
      isModelLoading.value = false // Reset loading state
      
      // Cleanup Three.js
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      
      if (scene) {
        scene.traverse(object => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }
      
      if (renderer) {
        renderer.dispose()
      }
      
      if (controls) {
        controls.dispose()
      }
      
      selectedModel.value = null
    }

    const initLightboxViewer = (canvas, model) => {
      // Scene setup
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a2e)

      // Camera
      camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      )

      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const light = new THREE.DirectionalLight(0xffffff, 0.8)
      light.position.set(1, 1, 1)
      scene.add(light)

      // Controls
      controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      // Load model
      const loader = new GLTFLoader()
      loader.load(
        model.url,
        gltf => {
          const model = gltf.scene
          scene.add(model)

          // Auto-fit
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3()).length()
          const fov = camera.fov * (Math.PI / 180)
          const cameraZ = Math.abs(size / 2 / Math.tan(fov / 2)) * 1.5
          
          camera.position.set(center.x, center.y, center.z + Math.max(cameraZ, 3))
          camera.lookAt(center)
          controls.target.copy(center)
          controls.update()
          
          isModelLoading.value = false // Hide spinner when model loads
        },
        undefined,
        error => {
          console.error('Error loading model:', error)
          selectedModel.value.error = true // Fixed bug: use selectedModel instead of inner model variable
          isModelLoading.value = false // Hide spinner on error
          closeLightbox()
        }
      )

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // Handle resize
      const handleResize = () => {
        if (!canvas) return
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      }
      
      window.addEventListener('resize', handleResize)
      
      // Store cleanup function
      canvas._cleanupResize = () => window.removeEventListener('resize', handleResize)
    }

    onUnmounted(() => {
      if (lightboxCanvasRef.value?._cleanupResize) {
        lightboxCanvasRef.value._cleanupResize()
      }
      closeLightbox()
    })

    return { 
      models, 
      isLightboxOpen, 
      isModelLoading,
      lightboxCanvasRef, 
      viewModel, 
      closeLightbox, 
      selectedModel 
    }
  }
}
</script>


<template>
  <div class="container">
    <h1>3D Model Gallery</h1>
    
    <div class="model-grid">
      <div 
        v-for="model in models" 
        :key="model.id"
        class="model-box"
        @click="viewModel(model)"
      >
        <h3>{{ model.name }}</h3>
        <p>{{ model.description }}</p>
        <span v-if="model.error" class="error-badge">Load Failed</span>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="isLightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
      <div class="lightbox-content">
        <button class="back-button" @click="closeLightbox">← Go Back</button>
        
        <!-- Loading Spinner -->
        <div v-if="isModelLoading" class="spinner-overlay">
          <div class="spinner"></div>
          <p class="loading-text">Loading 3D Model...</p>
        </div>
        
        <canvas 
          ref="lightboxCanvasRef" 
          class="lightbox-canvas"
          :class="{ 'hidden': isModelLoading }"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #0a0a0a;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5em;
  color: #fff;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.model-box {
  background: #16213e;
  border: 2px solid #0f4c75;
  border-radius: 8px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.model-box:hover {
  border-color: #4a90e2;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(74, 144, 226, 0.2);
}

.model-box h3 {
  font-size: 1.3em;
  margin-bottom: 8px;
}

.model-box p {
  font-size: 0.9em;
  color: #aaa;
}

.error-badge {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 8px;
  background: #ff6b6b;
  color: white;
  border-radius: 4px;
  font-size: 0.8em;
}

/* Lightbox styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lightbox-content {
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1200px;
  background: #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
}

.lightbox-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.lightbox-canvas.hidden {
  opacity: 0;
}

/* Spinner styles */
.spinner-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 100;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top: 5px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #fff;
  font-size: 16px;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #4a90e2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  z-index: 10;
  transition: background 0.2s;
}

.back-button:hover {
  background: #5ba0f2;
}
</style>
