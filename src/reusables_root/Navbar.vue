<template>
  <nav class="navbar">
    <div class="nav-container">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="nav-item"
        :class="{ active: activeTab.value === index }"
        @click="changeRoute(tab.url)"
      >
        {{ tab.label }}
      </div>
      <div
        class="slider"
        :style="sliderStyle"
      ></div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'


// State
const tabs = [
  {label: 'Home', url: '?tab=home'}, 
  {label: 'About', url: '?tab=about'}, 
  {label: 'Services', url: '?tab=services'}, 
  {label: 'Portfolio', url: '?tab=portofolio'}, 
  {label: 'Contact', url: '?tab=contact'}
]
const activeTab = ref(0)
const sliderStyle = ref({ left: '0px', width: '0px' })

const changeRoute = (url) => {
  console.log(url)

  window.location = url
}

// Update slider position based on active tab
const updateSlider = () => {
  nextTick(() => {
    const activeEl = document.querySelector('.nav-item.active')
    if (activeEl) {
      sliderStyle.value = {
        left: `${activeEl.offsetLeft}px`,
        width: `${activeEl.offsetWidth}px`
      }
    }
  })
}

// Set active tab and trigger slider update
const setActiveTab = (index) => {
  activeTab.value = index
  updateSlider()
}

// Initialize slider on mount
onMounted(updateSlider)

// Watch for changes (e.g., if tabs are dynamic)
watch(activeTab, updateSlider)
</script>

<style scoped>
.navbar {
  background: #1e1e1e; /* Dark background */
  border-radius: 50px;
  padding: 0px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin: 0.5rem auto;
  font-family: 'Inter', system-ui, sans-serif;
}

.nav-container {
  position: relative;
  display: flex;
  justify-content: space-between;
}

.nav-item {
  flex: 1;
  text-align: center;
  padding: 4px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: #a0a0a0; /* Muted text for inactive */
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
  user-select: none;
}

.nav-item:hover {
  color: #e0e0e0;
}

.nav-item.active {
  color: #ffffff;
  font-weight: 700;
}

.slider {
  position: absolute;
  height: 100%;
  border-radius: 50px;
  background: linear-gradient(135deg, #8a2be2, #4a00e0); /* Deep purple gradient */
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1;
}
</style>
