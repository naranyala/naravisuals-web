
<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

import Taskbar from "./os-like/Taskbar.vue"

const emit = defineEmits(["toggle-os"])


/* taskbar-start */
const activeWindowId = ref(null)
const windows = reactive([])

const focusOrMinimize = (id) => {
  if (activeWindowId.value === id) {
    minimizeWindow(id)
  } else {
    focusWindow(id)
  }
}

const minimizeWindow = (id) => {
  // In a real implementation, you'd hide the window
  // For simplicity, we'll just remove it from view
  closeWindow(id)
}

const focusWindow = (id) => {
  activeWindowId.value = id
  // Bring to front
  const maxZ = Math.max(...windows.map(w => w.zIndex), 0)
  const win = windows.find(w => w.id === id)
  if (win) win.zIndex = maxZ + 1
}
const closeWindow = (id) => {
  const index = windows.findIndex(w => w.id === id)
  windows.splice(index, 1)
  if (activeWindowId.value === id) {
    activeWindowId.value = windows.length ? windows[windows.length - 1].id : null
  }
}


const showStartMenu = ref(false)
const toggleStartMenu = () => {
  showStartMenu.value = !showStartMenu.value
}

/* taskbar-end */



// State
const desktopRef = ref(null)
const startMenuRef = ref(null)
const currentTime = ref(new Date().toLocaleTimeString())
const dragState = ref({
  isDragging: false,
  windowId: null,
  offsetX: 0,
  offsetY: 0
})


const actionExit = () => emit('toggle-os')


import WelcomePage from "./os-like/WelcomePage.vue"
import SettingPage from "./os-like/SettingPage.vue"

const appComponents = {
  welcomePage: { obj: WelcomePage },
  notepad: { obj: () => "WIP" },
  calculator: { obj: () => "WIP" },
  globalState: { obj: () => "WIP" },
  settingPage: { obj: SettingPage }
}

const listApps = [
  { id: "welcomePage", name: 'Welcome', emoji: '📦'},
  { id: "notepad", name: 'Notepad', emoji: '📦' },
  { id: "calculator", name: 'Calculator', emoji: '📦' },
  { id: "globalState", name: 'Global State', emoji: '📦' },
  { id: "settingPage", name: 'Setting Page', emoji: '📦' },
]


// Window Management
const WINDOW_WIDTH = 600
const WINDOW_HEIGHT = 400

const createWindow = (app, selectedId) => {

  // const id = Date.now()
  const id = crypto.randomUUID()
  const desktopRect = desktopRef.value.getBoundingClientRect()

  // Calculate centered position
  const x = (desktopRect.width - WINDOW_WIDTH) / 2
  const y = (desktopRect.height - WINDOW_HEIGHT) / 2

console.log("selected-id: ", selectedId)

  windows.push({
    id,
    title: app.name,
    // component: appComponents["welcomePage"],
    component: appComponents[selectedId],
    // component: appComponents["settingPage"],
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

<template>
  <div ref="desktopRef" class="desktop" @click="closeStartMenu">
    <!-- Desktop Icons (optional) -->
    <div class="desktop-icons">
      <div v-for="item in listApps" :key="item.id" class="icon" @dblclick.prevent="createWindow(item, item.id)">

        <div class="icon-image">{{ item.emoji }}</div>
        <div class="icon-label">{{ item.name }}</div>
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
        <component v-if="win.component.obj" :is="win.component.obj" /> 
       
        <hr/>

        <div class="debug">
        <small>
          {{ JSON.stringify(win, null, 2) }}
        </small>
        </div>
      </div>


    </div>

    <!-- Taskbar -->
    <Taskbar :leftSideContent="[]" :rightSideContent="windows"/>


    <!-- Start Menu -->
    <div v-if="showStartMenu" ref="startMenuRef" class="start-menu" @click.stop>
      <div class="start-menu-header">
        <div class="user-info">
          <div class="user-icon">👤</div>
          <div>VueUser</div>
        </div>
      </div>

      <div class="start-menu-items">
        <div v-for="app in listApps" :key="app.id" class="start-menu-item" @click="launchApp(app)">
          <span>{{ app.emoji }}</span>
          <span>{{ app.name }}</span>
        </div>
        <div class="start-menu-item" @click="actionExit">
          {{"❌"}}
          <span>Exit</span>
        </div>
      </div>
    </div>


  </div>
</template>


<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.desktop {
  width: 100vw;
  /* height: 100vh; */
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
  max-width: 100vh;
  color: black;
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
  padding: 0;
  overflow: auto;
  z-index: 2;
  color: black;

  div { margin: 0; }
}

.app-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
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


aside {
  z-index: 1;
  width: 320px;
  position: fixed;
  right: 0;
  top: 0;
  font-size: 0.8rem;
  overflow-y: auto;
  height: max-content;
}

.debug { background: white; color: black; margin: 20px; border: 1px solid gray; }
  
</style>

