<script setup>
import {
  ref, computed, onMounted, onUnmounted, watchEffect
} from 'vue'

const isSidebarOpen = ref(false)
const isMobile = ref(false)
const searchQuery = ref('')


// import MottoCollection from "./MottoCollection.vue"
import MyComponentExploration from "./MyComponentExploration.vue"

import CodeShowView from "./CodeShowView.vue"
import ProgrammingConceptView from "./ProgrammingConceptView.vue"
import CodeDumpRelearnView from "./CodeDumpRelearnView.vue"
import ProfileView from "./ProfileView.vue"
import GeneralFaqView from "./GeneralFaqView.vue"
import ClarityFAQ from "./ClarityFAQ.vue"
import CreativeView from "./CreativeView.vue"
import Creative3DView from "./Creative3DView.vue"

import ArticleView from "./ArticleView.vue"
import EasyBudgetView from "./EasyBudgetView.vue"
import SipenaView from "./SipenaView.vue"
import CodingAsHobbyView from "./CodingAsHobbyView.vue"
import SimulationCenterView from "./SimulationCenterView.vue"
import CreativeLyrics from "./CreativeLyrics.vue"
import MindmapMaker from "./MindmapRoot.vue"
import TheoryCollection from "./TheoryCollection.vue"
import CanvasExamplesView from "./CanvasExamplesView.vue"
import MyAnimationView from "./MyAnimationView.vue"
import RoadmapContainer from "./RoadmapContainer.vue"

import WelcomeCode from "./WelcomeCode.vue"
import CanvasEngineDemo from "./CanvasEngineDemo.vue"
import CanvasEngineMath from "./CanvasEngineMath.vue"
import CanvasEnginePhysics from "./CanvasEnginePhysics.vue"
import CanvasEngineGames from "./CanvasEngineGames.vue"
import ShapesThreeDimension from "./ShapesThreeDimension.vue"


import WrapperOfModernJS from "./explore-code/WrapperOfModernJS.vue"
import WrapperOfModernCSS from "./explore-code/WrapperOfModernCSS.vue"
// import DocsLayoutDemo from "./DocsLayoutDemo.vue"

import MonthlyChallenges from "./MonthlyChallenges.vue"
import DashboardLayoutWrapper from "./DashboardLayoutWrapper.vue"
import ChartContainer from "./ChartContainer.vue"
import CanvasEngineAudio from "./CanvasEngineAudio.vue"
import PdfViewer from "./BrowserPdfViewer.vue"
import AcademicPaper from "./AcademicPaper.vue"

const activeMenu = ref(0)

const navSections = [
  {
    title: 'future of me', items: [
      { label: 'Install', component: WrapperOfModernCSS },
      { label: 'First Bundle', component: WrapperOfModernJS },
      { label: 'Build Scripts', component: () => "sample" }
    ]
  },
  {
    title: 'present of me', items: [
      { label: 'Overview', component: () => "overview" },
      { label: 'Options', component: () => "option" },
      { label: 'Input', component: () => "testing" },
      { label: 'Output', component: () => "output" }
    ]
  },
  {
    title: 'past of me', items: [
      { label: 'Overview', component: () => "overview" },
      { label: 'Options', component: () => "option" },
      { label: 'Input', component: () => "testing" },
      { label: 'Output', component: () => "output" }
    ]
  }
]

const newNavSections = ref()

watchEffect(() => {


  let arr = []

  navSections.forEach(section => {
    section.items.forEach((item, idx) => {
      arr.push({ id: idx, ...item })
    })
  })

  console.log(arr)

  newNavSections.value = arr
})

const benchmarks = [
  { name: 'esbuild', time: 0.39 },
  { name: 'parcel 2', time: 14.91 },
  { name: 'rollup 4', time: 34.1 },
  { name: 'webpack 5', time: 41.21 }
]

const maxTime = Math.max(...benchmarks.map(b => b.time))
const getBarWidth = (time) => (time / maxTime) * 100

// Fuzzy search function
const fuzzyMatch = (text, query) => {
  if (!query) return { match: true, score: 0 }

  // console.log(text, " ", query)

  const textLower = text?.trim().toLowerCase()
  const queryLower = query?.trim().toLowerCase()

  let textIndex = 0
  let queryIndex = 0
  let score = 0
  const matches = []

  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      matches.push(textIndex)
      score += textIndex === queryIndex ? 2 : 1 // Bonus for consecutive matches
      queryIndex++
    }
    textIndex++
  }

  return {
    match: queryIndex === queryLower.length,
    score,
    matches
  }
}

// Filter sections based on search
const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return navSections

  const results = []

  navSections.forEach(section => {
    const filteredItems = section.items.filter(item => {
      return fuzzyMatch(item.label, searchQuery.value).match
    })

    // console.log("filter: ", filteredItems)

    if (filteredItems.length > 0) {
      results.push({
        ...section,
        items: filteredItems.sort((a, b) => {
          const scoreA = fuzzyMatch(a, searchQuery.value).score
          const scoreB = fuzzyMatch(b, searchQuery.value).score
          return scoreB - scoreA
        })
      })
    }
  })

  return results
})

// Highlight matched characters
const highlightMatch = (text) => {
  if (!searchQuery.value.trim()) return text

  const result = fuzzyMatch(text, searchQuery.value)
  if (!result.match) return text

  let highlighted = ''
  for (let i = 0; i < text.length; i++) {
    if (result.matches.includes(i)) {
      // highlighted += `<mark>${text[i]}</mark>`
      highlighted += `${text[i]}`
    } else {
      highlighted += text[i]
    }
  }

  return highlighted
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})


const props = defineProps(["isPrintAll", "activeMode"])
const isPrintAll = ref(props?.isPrintAll || true)


const tabs = ref([
  // { id: 0, label: "c-related", component: WelcomeCode },
  { id: 0, label: "c-related", component: () => "MAINTENANCE" },
  { id: 1, label: "rust-related", component: () => "MAINTENANCE" },
  // { id: 1, label: "rust-related", component: MonthlyChallenges },
  // { id: 1, label: "modern-css", component: WrapperOfModernCSS },
  // { id: 1, label: "modern-js", component: WrapperOfModernJS },
  { id: 1, label: "vue-related", component: () => "WIP" },
  { id: 1, label: "vue-setter-getter", component: () => "WIP" },
  { id: 1, label: "canvas-api", component: () => "WIP" }
]);


const changeRoute = (idx) => {
  activeMenu.value = idx;
}

</script>


<template>
  <div class="layout">
    <!-- Mobile Header -->
    <header v-if="isMobile" class="mobile-header">
      <button @click="toggleSidebar">
        MENU
        <!-- <span></span> -->
        <!-- <span></span> -->
        <!-- <span></span> -->
      </button>
      <h1>esbuild</h1>
    </header>

    <!-- Backdrop -->
    <div v-if="isMobile && isSidebarOpen" class="backdrop" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <div :class="{ 'pt-mobile': isMobile }">

        <div class="search-container">
          <input v-model="searchQuery" type="text" placeholder="Search menu..." class="search-input" />
        </div>

        <nav class="nav">
          <div v-for="(section, i) in filteredSections" :key="i" class="nav-section">
            <h3>{{ section.title }}</h3>
            <ul>
              <li v-for="(item, j) in section.items" :key="j">
                <button @click="changeRoute(j)" v-html="highlightMatch(item.label)"></button>
              </li>
            </ul>
          </div>
          <p v-if="filteredSections.length === 0" class="no-results">No results found</p>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main" :class="{ 'pt-mobile': isMobile }">
      <div class="container">

        <!-- START-LAYOUT -->

        <!-- <pre>{{ JSON.stringify(newNavSection, null, 2) }}</pre> -->



        <!-- Content -->
        <div v-if="!isPrintAll" class="tab-content">
          <component :is="newNavSections[activeMenu].component"></component>
        </div>

        <div v-else>
          <!-- PRINT MODE -->
          <!-- <ProfileView /> -->
          <!-- <hr /> -->
          <!-- <CodeDumpRelearnView /> -->
          <!-- <hr /> -->
          <!-- <ArticleView /> -->
          <!-- <hr /> -->
          <!-- <CreativeView /> -->
          <!-- <hr /> -->
          <!-- <Creative3DView /> -->
        </div>

        <!-- END-LAYOUT -->


      </div>
    </main>
  </div>
</template>


<style scoped>
* {
  box-sizing: border-box;
}

.layout {
  display: flex;
  height: 100vh;
  background: #111827;
  color: #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #111827;
  border-bottom: 1px solid #374151;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.mobile-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0 1rem;
}

.hamburger {
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  /* background: none; */
  /* background: black; */
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  width: 100%;
  height: 2px;
  background: #e5e7eb;
  border-radius: 2px;
}

/* Backdrop */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;
}

/* Sidebar */
.sidebar {
  width: 256px;
  height: 100vh;
  background: #1f2937;
  border-right: 1px solid #374151;
  overflow-y: auto;
  z-index: 40;
  transition: transform 0.3s ease;
}

.pt-mobile {
  padding-top: 56px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
}

.logo {
  width: 32px;
  height: 32px;
  background: #eab308;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  color: #000;
  margin-right: 0.75rem;
}

.sidebar-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.search-container {
  padding: 0 1.5rem 1rem 1.5rem;
  margin-top: 24px;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  border-color: #eab308;
}

.nav {
  padding: 0 1.5rem;
}

.nav-section {
  margin-top: 1.5rem;
}

.nav-section:first-child {
  margin-top: 0;
}

.nav-section h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin: 0 0 0.75rem 0;
}

.nav-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-section li {
  margin-bottom: 0.25rem;
}

.nav-section a {
  font-size: 0.875rem;
  color: #d1d5db;
  text-decoration: none;
  display: block;
  padding: 0.25rem 0;
}

.nav-section a:hover {
  color: #f9fafb;
}

.no-results {
  padding: 1rem 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

mark {
  /* background: #eab308; */
  background: #eba134;
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
}

/* Main Content */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.container {
  max-width: 896px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
}

.page-header p {
  font-size: 1.125rem;
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
}

/* Performance Chart */
.chart {
  background: #1f2937;
  padding: 1.25rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.chart-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  height: 20px;
}

.tool-name {
  width: 130px;
  font-size: 0.875rem;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  height: 16px;
  background: #374151;
  border-radius: 0.25rem;
  margin: 0 0.75rem;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: #eab308;
  border-radius: 0.25rem;
}

.tool-time {
  width: 45px;
  font-size: 0.875rem;
  text-align: right;
}

.chart-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.intro {
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #d1d5db;
}

h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}

.features {
  list-style: disc;
  padding-left: 1.25rem;
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
}

.features li {
  margin-bottom: 0.5rem;
}

/* Mobile Styles */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

/* Desktop Styles */
@media (min-width: 768px) {
  .sidebar {
    position: static;
    flex-shrink: 0;
  }

  .page-header h1 {
    font-size: 3.75rem;
  }

  .page-header p {
    font-size: 1.25rem;
  }
}

/* Dark mode container */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* background-color: #121212; */
  /* Optional: if ul has its own bg */
}

/* List item */
li {
  margin: 0;
}

/* Dark mode button */
li button {
  width: 100%;
  /* padding: 14px 18px; */
  padding: 0 10px 0 28px;
  border: none;
  border-radius: 10px;
  /* background-color: #1e1e1e; */
  /* color: #e0e0e0; */
  background: none;
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  /* transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); */
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); */
  /* border: 1px solid #2d2d2d; */
  user-select: none;
}

/* Hover state – subtle lift & brighter bg */
li button:hover {
  /* background-color: #2a2a2a; */
  /* transform: translateY(-2px); */
  text-decoration: underline;
}

/* Active / Focus state */
li button:active {
  /* background-color: #333333; */
  /* transform: translateY(0); */
  text-decoration: underline;
}

li button:focus {
  outline: none;
}

/* Highlight for matched text */
li button span.highlight {
  /* background-color: #3a3a00; */
  /* Dark yellow bg */
  color: #ffeb3b;
  /* Bright yellow text */
  padding: 0 5px;
  border-radius: 4px;
  font-weight: 600;
  /* box-shadow: 0 0 4px rgba(255, 235, 59, 0.2); */
}


.tab-content {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ffffff;
  width: 100%;
}
</style>
