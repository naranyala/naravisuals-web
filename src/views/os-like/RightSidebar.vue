<script setup>
import { ref } from 'vue'

import ShortcutPanelMenu from "./ShortcutPanelMenu.vue"

const props = defineProps(["toggleStr", "content"])
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}


const rightWidth = 450
const rightStrWidth = rightWidth+"px";
const rightStrWidthInverse = (rightWidth * -1) + "px";

</script>

<template>
  <div class="app">
    <button class="toggle-btn" @click="toggleSidebar" aria-label="Toggle sidebar">
      debug
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ 'sidebar--open': isSidebarOpen }">
      <div class="sidebar-content">
        <!-- <ShortcutPanelMenu/> --> 
        <pre>{{props?.content}}</pre>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.toggle-btn {
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
  font-size: 1rem;
  margin: 65px 25px 0 0;

  &:hover { border: 1px solid white; }
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9;
  cursor: pointer;
}

.sidebar {
  position: fixed;
  top: 0;
  /* right: -250px; */
  right: v-bind(rightStrWidthInverse);
  /* width: 250px; */
  width: v-bind(rightStrWidth);
  height: 100vh;
  background: #1a202c;
  color: white;
  z-index: 10;
  transition: transform 0.3s ease;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.sidebar--open {
  /* transform: translateX(-250px); */
  /* transform: translateX(-350px); */
  transform: translateX(v-bind(rightStrWidthInverse));
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

.sidebar a:hover {
  color: white;
}

.main-content {
  padding: 2rem;
  margin-right: 0;
  transition: margin-right 0.3s ease;
}

@media (min-width: 768px) {
  .sidebar--open + .main-content {
    margin-right: 250px;
  }
}
</style>
