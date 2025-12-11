<template>
  <div class="settings-page">
    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <h2>Settings</h2>
      <ul>
        <li v-for="item in navItems" :key="item.id">
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="content">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- General Settings -->
      <section class="settings-section">
        <h3>General</h3>
        <div class="setting-item">
          <label>Primary Button</label>
          <div class="button-group">
            <button 
              :class="{ active: settings.primaryButton === 'left' }"
              @click="settings.primaryButton = 'left'"
            >
              Left
            </button>
            <button 
              :class="{ active: settings.primaryButton === 'right' }"
              @click="settings.primaryButton = 'right'"
            >
              Right
            </button>
          </div>
        </div>
      </section>

      <!-- Mouse Settings -->
      <section class="settings-section">
        <h3>Mouse</h3>
        
        <div class="setting-item">
          <label>Pointer Speed</label>
          <input 
            type="range" 
            v-model="settings.pointerSpeed" 
            min="1" 
            max="10"
          >
        </div>
        
        <div class="setting-item">
          <label>Mouse Acceleration</label>
          <div class="toggle">
            <input 
              type="checkbox" 
              v-model="settings.mouseAcceleration"
            >
            <span class="slider"></span>
          </div>
        </div>
        
        <div class="setting-item">
          <label>Scroll Direction</label>
          <div class="radio-group">
            <label>
              <input 
                type="radio" 
                v-model="settings.scrollDirection" 
                value="traditional"
              >
              Traditional
            </label>
            <label>
              <input 
                type="radio" 
                v-model="settings.scrollDirection" 
                value="natural"
              >
              Natural
            </label>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Centralized state
const settings = reactive({
  primaryButton: 'left',
  pointerSpeed: 5,
  mouseAcceleration: true,
  scrollDirection: 'natural'
})

// Navigation items
const navItems = [
  { id: 'apps', label: 'Apps', icon: '🧩' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'mouse', label: 'Mouse & Touchpad', icon: '🖱️' },
  { id: 'keyboard', label: 'Keyboard', icon: '⌨️' },
  { id: 'color', label: 'Color', icon: '🎨' },
  { id: 'system', label: 'System', icon: '⚙️' }
]

// Tabs
const tabs = [
  { id: 'mouse', label: 'Mouse' },
  { id: 'touchpad', label: 'Touchpad' }
]

// Active tab state
const activeTab = ref('mouse')
</script>

<style scoped>
.settings-page {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
}

.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
}

.sidebar h2 {
  padding: 0 20px 20px;
  margin: 0;
  font-size: 18px;
  color: #333;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s;
}

.sidebar li:hover {
  background: #f8f8f8;
}

.content {
  flex: 1;
  padding: 24px;
  background: white;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 500;
}

.tabs button.active {
  background: #e6f0ff;
  border-color: #0078d4;
  color: #0078d4;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-item label:first-child {
  font-weight: 500;
  color: #333;
}

/* Button Group */
.button-group {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.button-group button {
  padding: 8px 16px;
  background: white;
  border: none;
  cursor: pointer;
}

.button-group button.active {
  background: #0078d4;
  color: white;
}

/* Slider */
input[type="range"] {
  width: 180px;
  height: 20px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 10px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0078d4;
  cursor: pointer;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .2s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0078d4;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 24px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-group input {
  accent-color: #0078d4;
}
</style>
