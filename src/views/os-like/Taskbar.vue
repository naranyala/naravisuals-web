<script setup>
  import {ref, reactive} from "vue"

// import LeftSidebarWrapper from "./LeftSidebarWrapper.jsx"
import LeftSidebar from "./LeftSidebar.vue"
import RightSidebar from "./RightSidebar.vue"

const props = defineProps(["appList", "leftSideContent", "rightSideContent"])
const currentTime = ref(new Date().toLocaleTimeString())

/* taskbar-start */
const activeWindowId = ref(null)
const windows = reactive(props?.appList || [])

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
</script>

<template>


    <div class="taskbar" @click.stop>

      <LeftSidebar/>

      <!-- <div class="start-button" @click.stop="toggleStartMenu"> -->
      <!--   <span>Start</span> -->
      <!-- </div> -->

      <!-- Open Windows -->
      <div class="taskbar-items">
        <div v-for="win in windows" :key="win.id" class="taskbar-item" :class="{ active: activeWindowId === win.id }"
          @click="focusOrMinimize(win.id)">
          {{ win.title }}
        </div>
      </div>

      <div class="center-task">{{currentTime}}</div>

      <!-- System Tray -->
      <!-- <div class="system-tray"> -->
      <!--   <span>{{ currentTime }}</span> -->
      <!-- </div> -->

      <RightSidebar :toggleStr="currentTime" :content="props?.rightSideContent"/>
    </div>
</template>

<style scoped>

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

  .center-task {
    width: 100%;
    text-align: center;
  }

</style>
