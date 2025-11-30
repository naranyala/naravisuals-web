<template>
  <div class="dashboard">
    <!-- Top Bar -->
    <header class="topbar">
      <button class="icon-btn" @click="toggleSidebar('left')">left</button>
      <div class="title">Playground</div>
      <div class="actions">
        <button class="icon-btn" @click="toggleSidebar('bottom')">bottom</button>
        <button class="icon-btn" @click="toggleSidebar('right')">right</button>
      </div>
    </header>

    <!-- Main Workspace with Bottom Panel -->
    <div class="workspace">

      <!-- LEFT Sidebar -->
      <aside class="sidebar-left" :class="{ active: leftSidebarOpen }">
        <div class="sidebar-header">
          <div class="sidebar-title">Entities</div>
          <button class="close-btn" @click="toggleSidebar('left')">×</button>
        </div>
        <div class="sidebar-scroll">
          <ul class="entity-list">
            <li v-for="n in 20" :key="n" @click="selectEntity(n)">Entity {{ n }}</li>
          </ul>
        </div>
      </aside>

      <!-- CENTER Content -->
      <main class="main-view">
        <div class="viewport">
          <!-- Replace with canvas/webgl/editor -->
          <div class="placeholder">Viewport Area</div>
        </div>
      </main>

      <!-- RIGHT Sidebar -->
      <aside class="sidebar-right" :class="{ active: rightSidebarOpen }">
        <div class="sidebar-header">
          <div class="sidebar-title">Inspector</div>
          <button class="close-btn" @click="toggleSidebar('right')">×</button>
        </div>
        <div class="sidebar-scroll">
          <section class="panel" v-for="n in 4" :key="n">
            <h3>Component {{ n }}</h3>
            <div class="panel-body">
              <label>
                Value A
                <input type="number" />
              </label>
              <label>
                Value B
                <input type="number" />
              </label>
            </div>
          </section>
        </div>
      </aside>

      <!-- BOTTOM Panel -->
      <aside class="sidebar-bottom" :class="{ active: bottomPanelOpen }">
        <div class="sidebar-header">
          <div class="sidebar-title">Console / Timeline</div>
          <button class="close-btn" @click="toggleSidebar('bottom')">×</button>
        </div>
        <div class="sidebar-scroll">
          <div class="console-content">
            <div v-for="n in 15" :key="n" class="console-line">
              [{{ new Date().toLocaleTimeString() }}] Log message {{ n }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div class="overlay" :class="{ active: leftSidebarOpen || rightSidebarOpen || bottomPanelOpen }"
        @click="closeSidebars"></div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const leftSidebarOpen = ref(true); // Default open on desktop
const rightSidebarOpen = ref(true); // Default open on desktop
const bottomPanelOpen = ref(false); // Default closed

const toggleSidebar = (side) => {
  if (side === 'left') {
    leftSidebarOpen.value = !leftSidebarOpen.value;
  } else if (side === 'right') {
    rightSidebarOpen.value = !rightSidebarOpen.value;
  } else if (side === 'bottom') {
    bottomPanelOpen.value = !bottomPanelOpen.value;
  }
};

const closeSidebars = () => {
  leftSidebarOpen.value = false;
  rightSidebarOpen.value = false;
  bottomPanelOpen.value = false;
};

const selectEntity = (n) => {
  console.log('Selected entity:', n);
  // On mobile, close sidebar after selection
  if (window.innerWidth < 768) {
    leftSidebarOpen.value = false;
  }
};
</script>

<style scoped>
/* Dark Theme */
.dashboard {
  background: #1e1e1e;
  color: #eee;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Bar */
.topbar {
  height: 48px;
  background: #2b2b2b;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #3a3a3a;
  gap: 12px;
  z-index: 100;
}

.topbar .title {
  font-size: 16px;
  font-weight: 600;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.icon-btn {
  background: #3a3a3a;
  border: none;
  color: #ccc;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #4b4b4b;
}

/* Workspace Layout */
.workspace {
  display: flex;
  height: calc(100vh - 48px);
  position: relative;
  overflow: hidden;
}

/* Sidebars Base Styles */
.sidebar-left,
.sidebar-right {
  background: #252525;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-right {
  border-left: 1px solid #333;
  border-right: none;
}

/* Desktop Sidebar Behavior */
.sidebar-left {
  width: 260px;
  min-width: 260px;
  flex-shrink: 0;
  height: 100%;
  transition: all 0.3s ease;
}

.sidebar-right {
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  height: 100%;
  transition: all 0.3s ease;
}

/* When bottom panel is active, shrink sidebars height */
.sidebar-bottom.active~.sidebar-left,
.sidebar-bottom.active~.sidebar-right {
  height: calc(100% - 250px);
}

/* Sidebar Closed States */
.sidebar-left:not(.active) {
  width: 0;
  min-width: 0;
  border-right: none;
}

.sidebar-right:not(.active) {
  width: 0;
  min-width: 0;
  border-left: none;
}

/* Main Viewport */
.main-view {
  background: #1a1a1a;
  flex: 1;
  display: flex;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

/* When bottom panel is active, shrink main viewport height */
.sidebar-bottom.active~.main-view {
  height: calc(100% - 250px);
}

.viewport {
  flex-grow: 1;
  position: relative;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
  border: 2px dashed #333;
}

/* Bottom Panel */
.sidebar-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #252525;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 0;
}

.sidebar-bottom.active {
  height: 250px;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #2e2e2e;
  border-bottom: 1px solid #3a3a3a;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
}

/* Sidebar Scroll Areas */
.sidebar-scroll {
  overflow-y: auto;
  flex-grow: 1;
  transition: height 0.3s ease;
}

/* Entity List */
.entity-list {
  list-style: none;
  padding: 10px;
  margin: 0;
}

.entity-list li {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.entity-list li:hover {
  background: #333;
}

/* Inspector Panels */
.panel {
  border-bottom: 1px solid #3a3a3a;
  padding: 10px;
}

.panel h3 {
  margin: 0;
  font-size: 13px;
  margin-bottom: 8px;
}

.panel-body label {
  display: grid;
  margin-bottom: 8px;
  font-size: 12px;
}

.panel-body input {
  background: #1c1c1c;
  border: 1px solid #444;
  color: #eee;
  padding: 4px;
  border-radius: 4px;
  margin-top: 4px;
}

.panel-body input:focus {
  outline: none;
  border-color: #666;
}

/* Console Content */
.console-content {
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.console-line {
  padding: 4px 0;
  color: #aaa;
  border-bottom: 1px solid #2a2a2a;
}

/* Overlay */
.overlay {
  display: none;
}

/* TABLET: 768px - 1024px */
@media (max-width: 1024px) {
  .sidebar-left {
    width: 220px;
    min-width: 220px;
  }

  .sidebar-right {
    width: 280px;
    min-width: 280px;
  }
}

/* MOBILE: Below 768px */
@media (max-width: 768px) {
  .workspace {
    display: block;
  }

  .sidebar-left,
  .sidebar-right,
  .sidebar-bottom {
    position: fixed;
    z-index: 50;
  }

  .sidebar-left,
  .sidebar-right {
    top: 48px;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    height: auto !important;
    /* Override desktop height adjustments on mobile */
  }

  .sidebar-left {
    left: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-right {
    right: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .sidebar-left.active {
    transform: translateX(0);
  }

  .sidebar-right.active {
    transform: translateX(0);
  }

  /* Reset desktop behavior on mobile */
  .sidebar-left:not(.active),
  .sidebar-right:not(.active) {
    width: 280px;
    min-width: 280px;
  }

  /* Main viewport full height on mobile */
  .main-view {
    height: 100% !important;
  }

  /* Bottom panel mobile behavior */
  .sidebar-bottom {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    max-height: 400px;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .sidebar-bottom.active {
    transform: translateY(0);
    height: 60vh;
  }

  .sidebar-bottom:not(.active) {
    height: 60vh;
    transform: translateY(100%);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .overlay.active {
    opacity: 1;
    pointer-events: all;
  }

  .placeholder {
    font-size: 18px;
  }
}

/* SMALL MOBILE: Below 480px */
@media (max-width: 480px) {
  .topbar {
    padding: 0 8px;
  }

  .topbar .title {
    font-size: 14px;
  }

  .actions {
    gap: 6px;
  }

  .icon-btn {
    padding: 6px 8px;
    font-size: 14px;
  }

  .sidebar-left,
  .sidebar-right {
    width: 100%;
    max-width: 100%;
  }

  .sidebar-bottom {
    height: 70vh;
    max-height: 70vh;
  }

  .sidebar-bottom.active {
    height: 70vh;
  }

  .sidebar-bottom:not(.active) {
    height: 70vh;
  }

  .placeholder {
    font-size: 16px;
  }
}

/* EXTRA SMALL MOBILE: Below 360px */
@media (max-width: 360px) {
  .topbar {
    padding: 0 6px;
    gap: 8px;
  }

  .icon-btn {
    padding: 4px 6px;
    font-size: 12px;
  }

  .topbar .title {
    font-size: 13px;
  }

  .sidebar-header {
    padding: 8px 12px;
  }

  .sidebar-title {
    font-size: 13px;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 24px;
  }
}

/* Scrollbar Styling */
.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
