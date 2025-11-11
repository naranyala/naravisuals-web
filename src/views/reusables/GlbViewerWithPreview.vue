<template>
  <div class="viewer-wrapper">
    <!-- Thumbnail preview -->
    <div class="thumbnail" @click="openModal">
      <div v-if="loading" class="thumb-loading">Loading...</div>
      <canvas v-else ref="thumbCanvas" class="thumb-canvas"></canvas>
      <div class="thumb-label">{{ label }}</div>
    </div>

    <!-- Full-screen modal -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <button class="close-btn" @click="closeModal">✕</button>
            <div v-if="modalLoading" class="modal-loading">Loading Model...</div>
            <canvas ref="modalCanvas" class="modal-canvas"></canvas>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  glbUrl: { type: String, required: true },
  label: { type: String, default: 'Model' }
})

/* ---------- STATE ---------- */
const thumbCanvas = ref(null)
const modalCanvas = ref(null)
const modalVisible = ref(false)
const loading = ref(true)
const modalLoading = ref(false)

/* ---------- THREE.JS OBJECTS ---------- */
let thumbScene, thumbCamera, thumbRenderer, thumbModel, thumbAnimId
let modalScene, modalCamera, modalRenderer, modalControls, modalModel, modalAnimId
const loader = new GLTFLoader()

/* ---------- THUMBNAIL PREVIEW ---------- */
const initThumbnail = async () => {
  if (!thumbCanvas.value) return
  
  const width = 220, height = 160
  thumbScene = new THREE.Scene()
  thumbScene.background = new THREE.Color(0xf5f5f5)

  thumbCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  thumbCamera.position.set(2, 1.5, 3)

  thumbRenderer = new THREE.WebGLRenderer({
    canvas: thumbCanvas.value,
    antialias: true,
    alpha: true
  })
  thumbRenderer.setSize(width, height)
  thumbRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit for performance

  // lights
  thumbScene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(1, 1, 1)
  thumbScene.add(dir)

  // Load model for thumbnail
  await loadModelForThumb()
  
  if (thumbModel) {
    animateThumbnail()
    loading.value = false
  }
}

const loadModelForThumb = () => {
  return new Promise((resolve) => {
    loader.load(
      props.glbUrl,
      gltf => {
        thumbModel = gltf.scene
        fitObjectToCamera(thumbModel, thumbCamera, 2.5)
        thumbScene.add(thumbModel)
        resolve()
      },
      (progress) => {
        // Optional: Add progress tracking
        console.log('Thumbnail loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%')
      },
      err => {
        console.error('Thumb GLB error:', err)
        loading.value = false
        resolve()
      }
    )
  })
}

const animateThumbnail = () => {
  if (!thumbModel) return
  
  thumbAnimId = requestAnimationFrame(animateThumbnail)
  thumbModel.rotation.y += 0.006
  thumbRenderer.render(thumbScene, thumbCamera)
}

/* ---------- MODAL VIEWER ---------- */
const openModal = () => {
  modalVisible.value = true
  modalLoading.value = true
}

const closeModal = () => {
  modalVisible.value = false
  cleanupModal()
}

const initModal = async () => {
  await nextTick() // Wait for DOM to update
  
  if (!modalCanvas.value) return

  const w = window.innerWidth * 0.85
  const h = window.innerHeight * 0.85

  modalScene = new THREE.Scene()
  modalScene.background = new THREE.Color(0x111111)

  modalCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
  modalCamera.position.set(4, 3, 6)

  modalRenderer = new THREE.WebGLRenderer({
    canvas: modalCanvas.value,
    antialias: true
  })
  modalRenderer.setSize(w, h)
  modalRenderer.setPixelRatio(window.devicePixelRatio)

  modalControls = new OrbitControls(modalCamera, modalRenderer.domElement)
  modalControls.enableDamping = true
  modalControls.dampingFactor = 0.05

  // lights
  modalScene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const dir = new THREE.DirectionalLight(0xffffff, 1)
  dir.position.set(5, 10, 7)
  modalScene.add(dir)

  // Add additional light for better visibility
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
  backLight.position.set(-5, -5, -5)
  modalScene.add(backLight)

  window.addEventListener('resize', onResize)
  animateModal()
  
  // Load model for modal
  await loadModelForModal()
  modalLoading.value = false
}

const loadModelForModal = () => {
  return new Promise((resolve) => {
    loader.load(
      props.glbUrl,
      gltf => {
        if (modalModel) modalScene.remove(modalModel)
        modalModel = gltf.scene
        fitObjectToCamera(modalModel, modalCamera, 4)
        modalScene.add(modalModel)
        modalControls.update()
        resolve()
      },
      undefined,
      err => {
        console.error('Modal GLB error:', err)
        modalLoading.value = false
        resolve()
      }
    )
  })
}

const animateModal = () => {
  modalAnimId = requestAnimationFrame(animateModal)
  modalControls.update()
  modalRenderer.render(modalScene, modalCamera)
}

const onResize = () => {
  if (!modalCamera || !modalRenderer) return
  
  const w = window.innerWidth * 0.85
  const h = window.innerHeight * 0.85
  modalCamera.aspect = w / h
  modalCamera.updateProjectionMatrix()
  modalRenderer.setSize(w, h)
}

/* ---------- UTILS ---------- */
const fitObjectToCamera = (object, camera, distanceFactor = 3) => {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const fitDist = maxDim * distanceFactor

  object.position.sub(center)               // center at origin
  camera.position.set(fitDist, fitDist * 0.7, fitDist)
  camera.lookAt(0, 0, 0)
  
  if (modalControls) {
    modalControls.target.set(0, 0, 0)
    modalControls.update()
  }
}

/* ---------- CLEANUP ---------- */
const cleanupThumb = () => {
  cancelAnimationFrame(thumbAnimId)
  if (thumbRenderer) {
    thumbRenderer.dispose()
    thumbRenderer.forceContextLoss()
  }
  thumbScene?.clear()
}

const cleanupModal = () => {
  cancelAnimationFrame(modalAnimId)
  window.removeEventListener('resize', onResize)
  if (modalRenderer) {
    modalRenderer.dispose()
    modalRenderer.forceContextLoss()
  }
  modalControls?.dispose()
  modalScene?.clear()
}

const cleanupAll = () => {
  cleanupThumb()
  cleanupModal()
}

/* ---------- LIFECYCLE ---------- */
onMounted(() => {
  initThumbnail()
})

watch(modalVisible, val => {
  if (val) {
    initModal()
  } else {
    cleanupModal()
  }
})

// Watch for URL changes to reload thumbnail
watch(() => props.glbUrl, () => {
  loading.value = true
  cleanupThumb()
  initThumbnail()
})

onUnmounted(cleanupAll)
</script>

<style scoped>
.viewer-wrapper {
  display: inline-block;
}

/* ---- Thumbnail ---- */
.thumbnail {
  width: 220px;
  height: 190px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
  position: relative;
}
.thumbnail:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}
.thumb-canvas {
  width: 100%;
  height: 160px;
  display: block;
}
.thumb-label {
  text-align: center;
  padding: 6px 0;
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
}
.thumb-loading {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
}

/* ---- Modal ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  position: relative;
  width: 85vw;
  height: 85vh;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
}
.modal-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;
}
.close-btn:hover {
  background: rgba(0,0,0,0.7);
}
.modal-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 1.2rem;
  z-index: 5;
}
.fade-enter-active,
.fade-leave-active { 
  transition: opacity 0.25s ease; 
}
.fade-enter-from,
.fade-leave-to { 
  opacity: 0; 
}
</style>
