<template>
  <div class="model-viewer-sfc">
    <!-- Thumbnail -->
    <button
      class="thumb-root"
      :aria-label="`Open ${label} preview`"
      @click="openModal"
      :disabled="thumbLoading || thumbError"
    >
      <div v-if="thumbError" class="thumb-error">Preview failed</div>
      <div v-else-if="thumbLoading" class="thumb-loading">Loading…</div>
      <canvas v-else ref="thumbCanvas" class="thumb-canvas"></canvas>
      <div class="thumb-label">{{ label }}</div>
    </button>

    <!-- Modal viewer -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card" role="dialog" aria-modal="true">
            <button class="close-btn" @click="closeModal" aria-label="Close viewer">✕</button>
            <div v-if="modalError" class="modal-state">Failed to load model</div>
            <div v-else-if="modalLoading" class="modal-state">Loading…</div>
            <canvas v-else ref="modalCanvas" class="modal-canvas"></canvas>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
/**
 * Vue 3 single-file component
 * - Props: glbUrl (required), label (optional)
 * - Uses: three, GLTFLoader, OrbitControls
 *
 * Ensure `three` package is installed in your project.
 */

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  glbUrl: { type: String, required: true },
  label: { type: String, default: '3D Model' }
})

/* ---------------- reactive state ---------------- */
const thumbCanvas = ref(null)
const modalCanvas = ref(null)

const thumbLoading = ref(true)
const thumbError = ref(false)

const modalOpen = ref(false)
const modalLoading = ref(false)
const modalError = ref(false)

/* ---------------- three objects (thumb & modal) ---------------- */
let thumb = {
  renderer: null,
  scene: null,
  camera: null,
  model: null,
  rafId: null,
  size: { w: 220, h: 160 }
}

let modal = {
  renderer: null,
  scene: null,
  camera: null,
  controls: null,
  model: null,
  rafId: null
}

const loader = new GLTFLoader()

/* ---------------- utilities ---------------- */
const clampDPR = (dpr) => Math.min(Math.max(dpr || 1, 1), 2)

function disposeThreeObject(obj) {
  if (!obj) return
  obj.traverse((child) => {
    if (child.geometry) {
      try { child.geometry.dispose() } catch (e) {}
    }
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        // dispose textures held by material
        for (const key in m) {
          const val = m[key]
          if (val && val.isTexture) {
            try { val.dispose() } catch (e) {}
          }
        }
        try { m.dispose && m.dispose() } catch (e) {}
      })
    }
  })
}

/* safe cancel RAF */
function cancelRAF(id) {
  try { if (id != null) cancelAnimationFrame(id) } catch (e) {}
}

/* ---------------- bounding / fit helper ---------------- */
function fitObjectToCamera(object, camera, factor = 2.5, controls = null) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const distance = maxDim * factor

  // move model so center sits at origin
  object.position.set(-center.x, -center.y, -center.z)

  // position camera
  camera.position.set(distance, distance * 0.7, distance)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()

  if (controls) {
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

/* ---------------- thumbnail lifecycle ---------------- */
async function initThumbnail() {
  thumbLoading.value = true
  thumbError.value = false

  const canvas = thumbCanvas.value
  if (!canvas) {
    thumbLoading.value = false
    thumbError.value = true
    return
  }

  const { w, h } = thumb.size
  const dpr = clampDPR(window.devicePixelRatio)

  // create scene, camera, renderer
  thumb.scene = new THREE.Scene()
  thumb.scene.background = new THREE.Color(0xf7f7f7)

  thumb.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
  thumb.camera.position.set(2, 1.5, 3)

  thumb.renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  })
  thumb.renderer.setPixelRatio(dpr)
  // set internal buffer size but keep DOM size controlled by CSS
  thumb.renderer.setSize(w, h, false)

  // lights
  thumb.scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(1, 1, 1)
  thumb.scene.add(dir)

  // load model
  try {
    const gltf = await loader.loadAsync(props.glbUrl)
    // clear previous if exists
    if (thumb.model) {
      thumb.scene.remove(thumb.model)
      disposeThreeObject(thumb.model)
      thumb.model = null
    }
    thumb.model = gltf.scene
    fitObjectToCamera(thumb.model, thumb.camera, 2.2)
    thumb.scene.add(thumb.model)
    startThumbLoop()
  } catch (err) {
    console.error('Thumbnail load error', err)
    thumbError.value = true
  } finally {
    thumbLoading.value = false
  }
}

function startThumbLoop() {
  cancelRAF(thumb.rafId)
  const loop = () => {
    thumb.rafId = requestAnimationFrame(loop)
    if (thumb.model) {
      thumb.model.rotation.y += 0.006
    }
    thumb.renderer && thumb.renderer.render(thumb.scene, thumb.camera)
  }
  loop()
}

/* ---------------- modal lifecycle ---------------- */
async function initModal() {
  modalLoading.value = true
  modalError.value = false

  await nextTick() // ensure canvas is in DOM (teleport)

  const canvas = modalCanvas.value
  if (!canvas) {
    modalLoading.value = false
    modalError.value = true
    return
  }

  const w = Math.max(480, Math.floor(window.innerWidth * 0.85))
  const h = Math.max(320, Math.floor(window.innerHeight * 0.85))
  const dpr = clampDPR(window.devicePixelRatio)

  // create scene/camera/renderer if not present; re-create renderer if canvas changed
  if (!modal.scene) modal.scene = new THREE.Scene()
  modal.scene.background = new THREE.Color(0x0b0b0b)

  if (!modal.camera) modal.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000)
  modal.camera.position.set(4, 3, 6)

  // if renderer missing or its canvas changed, create a fresh renderer
  if (!modal.renderer || modal.renderer.domElement !== canvas) {
    if (modal.renderer) {
      try {
        modal.renderer.dispose()
        modal.renderer.forceContextLoss && modal.renderer.forceContextLoss()
      } catch (e) {}
      modal.renderer = null
    }
    modal.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    modal.renderer.setPixelRatio(dpr)
    modal.renderer.setSize(w, h, false)
  } else {
    modal.renderer.setPixelRatio(dpr)
    modal.renderer.setSize(w, h, false)
  }

  // controls
  if (!modal.controls || modal.controls.object !== modal.camera || modal.controls.domElement !== modal.renderer.domElement) {
    modal.controls && modal.controls.dispose && modal.controls.dispose()
    modal.controls = new OrbitControls(modal.camera, modal.renderer.domElement)
    modal.controls.enableDamping = true
    modal.controls.dampingFactor = 0.06
    modal.controls.rotateSpeed = 0.8
    modal.controls.zoomSpeed = 0.9
  }

  // lights
  if (!modal._lightsAdded) {
    modal.scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const key = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(5, 8, 6)
    modal.scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.25)
    fill.position.set(-5, -5, -5)
    modal.scene.add(fill)
    modal._lightsAdded = true
  }

  // load model
  try {
    const gltf = await loader.loadAsync(props.glbUrl)
    if (modal.model) {
      modal.scene.remove(modal.model)
      disposeThreeObject(modal.model)
      modal.model = null
    }
    modal.model = gltf.scene
    fitObjectToCamera(modal.model, modal.camera, 3.8, modal.controls)
    modal.scene.add(modal.model)
    startModalLoop()
  } catch (err) {
    console.error('Modal load error', err)
    modalError.value = true
  } finally {
    modalLoading.value = false
  }
}

function startModalLoop() {
  cancelRAF(modal.rafId)
  const loop = () => {
    modal.rafId = requestAnimationFrame(loop)
    modal.controls && modal.controls.update()
    modal.renderer && modal.renderer.render(modal.scene, modal.camera)
  }
  loop()
}

/* ---------------- resize & cleanup ---------------- */
function onWindowResize() {
  // modal only needs responsive adjustments
  if (!modal.renderer || !modal.camera || !modalCanvas.value) return
  const w = Math.max(480, Math.floor(window.innerWidth * 0.85))
  const h = Math.max(320, Math.floor(window.innerHeight * 0.85))
  modal.camera.aspect = w / h
  modal.camera.updateProjectionMatrix()
  modal.renderer.setPixelRatio(clampDPR(window.devicePixelRatio))
  modal.renderer.setSize(w, h, false)
}

function cleanupThumb() {
  cancelRAF(thumb.rafId)
  thumb.rafId = null
  if (thumb.model && thumb.scene) {
    thumb.scene.remove(thumb.model)
    disposeThreeObject(thumb.model)
    thumb.model = null
  }
  if (thumb.renderer) {
    try {
      thumb.renderer.dispose()
      thumb.renderer.forceContextLoss && thumb.renderer.forceContextLoss()
    } catch (e) {}
    thumb.renderer = null
  }
  thumb.scene = null
  thumb.camera = null
}

function cleanupModal() {
  cancelRAF(modal.rafId)
  modal.rafId = null
  window.removeEventListener('resize', onWindowResize)
  if (modal.model && modal.scene) {
    modal.scene.remove(modal.model)
    disposeThreeObject(modal.model)
    modal.model = null
  }
  if (modal.controls) {
    try { modal.controls.dispose() } catch (e) {}
    modal.controls = null
  }
  if (modal.renderer) {
    try {
      modal.renderer.dispose()
      modal.renderer.forceContextLoss && modal.renderer.forceContextLoss()
    } catch (e) {}
    modal.renderer = null
  }
  modal.scene = null
  modal.camera = null
  modal._lightsAdded = false
}

/* ---------------- open/close + keyboard ---------------- */
function openModal() {
  if (modalOpen.value) return
  modalOpen.value = true
  modalLoading.value = true
  modalError.value = false
  // initialize modal after DOM mount (teleport)
  initModal()
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('keydown', onKeyDown)
}

function closeModal() {
  if (!modalOpen.value) return
  modalOpen.value = false
  cleanupModal()
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('keydown', onKeyDown)
}

function onKeyDown(e) {
  if (e.key === 'Escape') closeModal()
}

/* ---------------- watchers & lifecycle hooks ---------------- */
onMounted(() => {
  initThumbnail()
})

onUnmounted(() => {
  cleanupThumb()
  cleanupModal()
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('keydown', onKeyDown)
})

watch(() => props.glbUrl, async (newUrl, oldUrl) => {
  // reload both thumb and modal if needed
  thumbLoading.value = true
  thumbError.value = false
  cleanupThumb()
  await initThumbnail()

  if (modalOpen.value) {
    modalLoading.value = true
    modalError.value = false
    cleanupModal()
    await initModal()
  }
})
</script>

<style scoped>
.model-viewer-sfc {
  display: inline-block;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Thumbnail button */
.thumb-root {
  width: 220px;
  height: 190px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: block;
  text-align: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.04);
  transition: transform .16s ease, box-shadow .16s ease;
}
.thumb-root:disabled { cursor: default; opacity: 0.9; }
.thumb-root:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }

.thumb-canvas {
  display: block;
  width: 100%;
  height: 160px;
  background: #fff;
}

/* States */
.thumb-loading,
.thumb-error {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background: #fff;
}

/* Label */
.thumb-label {
  font-size: .95rem;
  padding: 8px 0;
  color: #222;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5,5,5,0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.modal-card {
  width: 85vw;
  height: 85vh;
  max-width: 1400px;
  max-height: 900px;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}

.modal-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  background: transparent;
}

/* close button */
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 1.1rem;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 5;
}
.close-btn:hover { background: rgba(0,0,0,0.6); }

/* modal state text */
.modal-state {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 1.1rem;
  z-index: 4;
}

/* transition */
.fade-enter-active, .fade-leave-active { transition: opacity .22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
