<template>
  <div class="dashboard">
    <!-- Top Bar -->
    <header class="topbar">
      <!-- <button class="menu-btn" @click="toggleSidebar('left')">☰</button> -->
      <button class="icon-btn" @click="toggleSidebar('left')">☰</button>
      <div class="title">Playground</div>
      <div class="actions">
        <button class="icon-btn" @click="toggleSidebar('right')">⚙</button>
      </div>
    </header>

    <!-- Main 3-Column Layout -->
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

      <!-- Overlay for mobile -->
      <div class="overlay" :class="{ active: leftSidebarOpen || rightSidebarOpen }" @click="closeSidebars"></div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const leftSidebarOpen = ref(false);
const rightSidebarOpen = ref(false);

const toggleSidebar = (side) => {
  if (side === 'left') {
    leftSidebarOpen.value = !leftSidebarOpen.value;
    if (leftSidebarOpen.value) rightSidebarOpen.value = false;
  } else {
    rightSidebarOpen.value = !rightSidebarOpen.value;
    if (rightSidebarOpen.value) leftSidebarOpen.value = false;
  }
};

const closeSidebars = () => {
  leftSidebarOpen.value = false;
  rightSidebarOpen.value = false;
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
}

.menu-btn {
  /* display: none; */
  display: block;
  background: #3a3a3a;
  border: none;
  color: #ccc;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 20px;
  line-height: 1;
}

.menu-btn:hover {
  background: #4b4b4b;
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
  display: none;
  background: #3a3a3a;
  border: none;
  color: #ccc;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.icon-btn:hover {
  background: #4b4b4b;
}

/* Workspace: Left - Center - Right */
.workspace {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  height: calc(100vh - 48px);
  position: relative;
}

/* Sidebars */
.sidebar-left,
.sidebar-right {
  background: #252525;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-right {
  border-left: 1px solid #333;
  border-right: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #2e2e2e;
  border-bottom: 1px solid #3a3a3a;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  display: none;
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #fff;
}

.sidebar-scroll {
  overflow-y: auto;
  flex-grow: 1;
}

.entity-list {
  list-style: none;
  padding: 10px;
  margin: 0;
}

.entity-list li {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
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
}

/* Center Viewport */
.main-view {
  background: #1a1a1a;
  display: flex;
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

/* Overlay */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* TABLET: 768px - 1024px */
@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 220px 1fr 280px;
  }
}

/* MOBILE: Below 768px */
@media (max-width: 768px) {

  .menu-btn,
  .icon-btn {
    display: block;
    padding: 6px 8px;
    font-size: 14px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .sidebar-left,
  .sidebar-right {
    position: fixed;
    top: 48px;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-left {
    left: 0;
  }

  .sidebar-right {
    right: 0;
    left: auto;
    transform: translateX(100%);
  }

  .sidebar-left.active {
    transform: translateX(0);
  }

  .sidebar-right.active {
    transform: translateX(0);
  }

  .close-btn {
    display: block;
  }

  .overlay.active {
    display: block;
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
    display: block;
    padding: 6px 8px;
    font-size: 14px;
  }

  .sidebar-left,
  .sidebar-right {
    width: 100%;
    max-width: 100%;
  }

  .placeholder {
    font-size: 16px;
  }
}
</style>
