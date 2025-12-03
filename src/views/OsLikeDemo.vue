<template>
  <div ref="desktopRef" class="desktop" @click="closeStartMenu">
    <!-- Desktop Icons (optional) -->
    <div class="desktop-icons">
      <div v-for="icon in desktopIcons" :key="icon.id" class="icon" @dblclick.prevent="openWindow(icon)">
        <div class="icon-image">{{ icon.emoji }}</div>
        <div class="icon-label">{{ icon.name }}</div>
      </div>
    </div>

    <!-- Windows -->
    <div v-for="win in windows" :key="win.id" class="window"
      :class="{ active: activeWindowId === win.id, maximized: win.maximized }" :style="{
        left: win.x + 'px',
        top: win.y + 'px',
        width: win.width + 'px',
        height: win.height + 'px',
        zIndex: win.zIndex
      }" @mousedown="focusWindow(win.id)">
      <div class="window-header" @mousedown="startDrag($event, win)" @dblclick.stop="toggleMaximize(win.id)">
        <div class="window-title">{{ win.title }}</div>
        <div class="window-controls">
          <button @click.stop="minimizeWindow(win.id)">−</button>
          <button @click.stop="toggleMaximize(win.id)">{{ win.maximized ? '❐' : '□' }}</button>
          <button @click.stop="closeWindow(win.id)">✕</button>
        </div>
      </div>
      <div class="window-content">
        <component :is="win.component" />
      </div>
    </div>

    <!-- Taskbar -->
    <div class="taskbar" @click.stop>
      <div class="start-button" @click.stop="toggleStartMenu">
        <span>Start</span>
      </div>

      <!-- Open Windows -->
      <div class="taskbar-items">
        <div v-for="win in windows" :key="win.id" class="taskbar-item" :class="{ active: activeWindowId === win.id }"
          @click="focusOrMinimize(win.id)">
          {{ win.title }}
        </div>
      </div>

      <!-- System Tray -->
      <div class="system-tray">
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- Start Menu -->
    <div v-if="showStartMenu" ref="startMenuRef" class="start-menu" @click.stop>
      <div class="start-menu-header">
        <div class="user-info">
          <div class="user-icon">👤</div>
          <div>VueUser</div>
        </div>
      </div>

      <div class="start-menu-items">
        <div v-for="app in startMenuApps" :key="app.id" class="start-menu-item" @click="launchApp(app)">
          <span>{{ app.emoji }}</span>
          <span>{{ app.name }}</span>
        </div>
        <div class="start-menu-item" @click="actionExit">Exit</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(["toggle-os"])

// State
const desktopRef = ref(null)
const startMenuRef = ref(null)
const showStartMenu = ref(false)
const windows = reactive([])
const activeWindowId = ref(null)
const currentTime = ref(new Date().toLocaleTimeString())
const dragState = ref({
  isDragging: false,
  windowId: null,
  offsetX: 0,
  offsetY: 0
})

// Desktop Icons
const desktopIcons = [
  { id: 1, name: 'Recycle Bin', emoji: '🗑️' },
  { id: 2, name: 'Vue.js', emoji: '⚛️' }
]

const actionExit = () => emit('toggle-os')

// Start Menu Apps
const startMenuApps = [
  { id: 'notepad', name: 'Notepad', emoji: '📝' },
  { id: 'calculator', name: 'Calculator', emoji: '🧮' },
  { id: 'browser', name: 'Browser', emoji: '🌐' },
]

// Window Components (simplified)
const Notepad = { template: '<div class="app-content">Notepad Content</div>' }
const Calculator = { template: '<div class="app-content">Calculator Content</div>' }
const Browser = { template: '<div class="app-content">Browser Content</div>' }

const appComponents = {
  notepad: Notepad,
  calculator: Calculator,
  browser: Browser
}

// Window Management
const WINDOW_WIDTH = 600
const WINDOW_HEIGHT = 400

const createWindow = (app) => {
  const id = Date.now()
  const desktopRect = desktopRef.value.getBoundingClientRect()

  // Calculate centered position
  const x = (desktopRect.width - WINDOW_WIDTH) / 2
  const y = (desktopRect.height - WINDOW_HEIGHT) / 2

  windows.push({
    id,
    title: app.name,
    component: appComponents[app.id],
    x,
    y,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    zIndex: windows.length + 10,
    maximized: false,
    originalX: x,
    originalY: y,
    originalWidth: WINDOW_WIDTH,
    originalHeight: WINDOW_HEIGHT
  })

  activeWindowId.value = id
  showStartMenu.value = false
}

const closeWindow = (id) => {
  const index = windows.findIndex(w => w.id === id)
  windows.splice(index, 1)
  if (activeWindowId.value === id) {
    activeWindowId.value = windows.length ? windows[windows.length - 1].id : null
  }
}

const minimizeWindow = (id) => {
  // In a real implementation, you'd hide the window
  // For simplicity, we'll just remove it from view
  closeWindow(id)
}

const toggleMaximize = (id) => {
  const win = windows.find(w => w.id === id)
  if (!win) return

  if (win.maximized) {
    // Restore to original size and position
    win.x = win.originalX
    win.y = win.originalY
    win.width = win.originalWidth
    win.height = win.originalHeight
    win.maximized = false
  } else {
    // Store original dimensions before maximizing
    win.originalX = win.x
    win.originalY = win.y
    win.originalWidth = win.width
    win.originalHeight = win.height

    // Maximize to fill available space (excluding taskbar)
    const desktopRect = desktopRef.value.getBoundingClientRect()
    win.x = 0
    win.y = 0
    win.width = desktopRect.width
    win.height = desktopRect.height - 40 // Account for taskbar height
    win.maximized = true
  }
}

const focusWindow = (id) => {
  activeWindowId.value = id
  // Bring to front
  const maxZ = Math.max(...windows.map(w => w.zIndex), 0)
  const win = windows.find(w => w.id === id)
  if (win) win.zIndex = maxZ + 1
}

const focusOrMinimize = (id) => {
  if (activeWindowId.value === id) {
    minimizeWindow(id)
  } else {
    focusWindow(id)
  }
}

const openWindow = (icon) => {
  // Create a simple window for desktop icons
  const app = { id: 'notepad', name: icon.name, emoji: icon.emoji }
  createWindow(app)
}

// Draggable Window Implementation
const startDrag = (event, win) => {
  if (win.maximized) return // Don't allow dragging maximized windows

  // Focus the window when starting to drag
  focusWindow(win.id)

  dragState.value = {
    isDragging: true,
    windowId: win.id,
    offsetX: event.clientX - win.x,
    offsetY: event.clientY - win.y
  }

  event.preventDefault()
}

const handleMouseMove = (event) => {
  if (!dragState.value.isDragging) return

  const win = windows.find(w => w.id === dragState.value.windowId)
  if (!win || win.maximized) return

  const desktopRect = desktopRef.value.getBoundingClientRect()

  // Calculate new position
  let newX = event.clientX - dragState.value.offsetX
  let newY = event.clientY - dragState.value.offsetY

  // Boundary checking
  newX = Math.max(0, Math.min(newX, desktopRect.width - win.width))
  newY = Math.max(0, Math.min(newY, desktopRect.height - win.height - 40)) // Account for taskbar

  win.x = newX
  win.y = newY
}

const handleMouseUp = () => {
  dragState.value.isDragging = false
  dragState.value.windowId = null
}

// Start Menu
const toggleStartMenu = () => {
  showStartMenu.value = !showStartMenu.value
}

const closeStartMenu = () => {
  showStartMenu.value = false
}

const launchApp = (app) => {
  createWindow(app)
}

// Time update
let timeInterval = null
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)

  // Add mouse event listeners for dragging
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// Click outside to close start menu
const handleClickOutside = (event) => {
  if (showStartMenu.value &&
    startMenuRef.value &&
    !startMenuRef.value.contains(event.target) &&
    event.target !== desktopRef.value) {
    showStartMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.desktop {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  overflow: hidden;
  position: relative;
  user-select: none;
}

/* Desktop Icons */
.desktop-icons {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 20px;
}

.icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 80px;
}

.icon-image {
  font-size: 32px;
  margin-bottom: 5px;
}

.icon-label {
  color: white;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-size: 12px;
}

/* Windows */
.window {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  min-width: 300px;
  min-height: 200px;
  transition: all 0.2s ease;
}

.window.maximized {
  border-radius: 0;
  box-shadow: none;
}

.window.active {
  border: 1px solid #0078d7;
  box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.3);
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
  border-bottom: 1px solid #ccc;
  cursor: move;
  user-select: none;
}

.window-title {
  font-weight: bold;
  font-size: 14px;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.window-controls button {
  width: 24px;
  height: 20px;
  border: 1px solid #999;
  background: #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.window-controls button:hover {
  background: #d0d0d0;
}

.window-content {
  flex: 1;
  padding: 12px;
  overflow: auto;
}

.app-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
}

/* Taskbar */
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(30, 30, 30, 0.9);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  z-index: 1000;
}

.start-button {
  background: #0066cc;
  color: white;
  padding: 5px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}

.start-button:hover {
  background: #0055aa;
}

.taskbar-items {
  display: flex;
  gap: 5px;
  flex: 1;
}

.taskbar-item {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}

.taskbar-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.system-tray {
  color: white;
  font-size: 12px;
  padding: 0 10px;
}

/* Start Menu */
.start-menu {
  position: absolute;
  bottom: 40px;
  left: 10px;
  width: 300px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid #444;
  border-radius: 5px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 1001;
  overflow: hidden;
}

.start-menu-header {
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-icon {
  font-size: 32px;
}

.start-menu-items {
  padding: 10px 0;
}

.start-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
}

.start-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
