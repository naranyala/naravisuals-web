
<script setup>
import { ref } from 'vue'

import StartPanelMenu from "./StartPanelMenu.vue"

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>


<template>
  <div class="app">
    <!-- Toggle Button -->
    <button 
      class="toggle-btn" 
      @click="toggleSidebar"
      aria-label="Toggle sidebar"
    >
      start
    </button>

    <!-- Sidebar Backdrop (dark, semi-transparent, under sidebar) -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-backdrop"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar (solid background, no blur) -->
    <aside 
      class="sidebar" 
      :class="{ 'sidebar--open': isSidebarOpen }"
    >
      <div class="sidebar-content">
        <StartPanelMenu/>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot/>
      <!-- <h1>Main Content</h1> -->
      <!-- <p>Click the ☰ button to open the sidebar.</p> -->
    </main>
  </div>
</template>


<style scoped>
/*
.app {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}
  */

/* Toggle Button */
.toggle-btn {
  /* position: fixed; */
  bottom: 0;
  left: 1rem;
  z-index: 10;
  background: none;
  color: white;
  border: 1px solid gray;
  width: 90px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  margin: 65px 25px 0 0;

  &:hover { border: 1px solid white; }

  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); */
}

/* Backdrop: Only as wide as the sidebar, dark & semi-transparent */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  /* width: 250px; */ 
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4); /* Dark with 40% opacity */
  z-index: 9;
  cursor: pointer;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: -250px; /* Hidden by default */
  width: 250px;
  height: 100vh;
  background: #1a202c; /* Solid dark background (no transparency/blur) */
  color: white;
  z-index: 10;
  transition: transform 0.3s ease;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.sidebar--open {
  transform: translateX(250px);
}

/* Sidebar content */
.sidebar h2 {
  margin-top: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 1.2rem 0;
}

.sidebar a {
  color: #e2e8f0;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.2s;
}

.sidebar-content { 
}

.sidebar a:hover {
  color: white;
}

/* Main content */
.main-content {
  padding: 2rem;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

/* Optional: On desktop, shift content when sidebar open */
@media (min-width: 768px) {
  .sidebar--open + .main-content {
    margin-left: 250px;
  }
}
</style>
