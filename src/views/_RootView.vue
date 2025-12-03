<script setup>

import {
  ref, onMounted, watch, watchEffect, computed, inject
} from "vue"
import URLManager from "../utilities/URLManager.js"
// import { useTitle } from "./composables/useTitle.ts"
import useLocalStorage from "./composables/useLocalStorage.js"
import {
  saveCurrentUrl, restoreLastUrl, setQueryParams, getQueryParams
} from "./utils.js"

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

import MonthlyChallenges from "./MonthlyChallenges.vue"
import DashboardLayoutWrapper from "./DashboardLayoutWrapper.vue"
import ChartContainer from "./ChartContainer.vue"
import CanvasEngineAudio from "./CanvasEngineAudio.vue"
import PdfViewer from "./BrowserPdfViewer.vue"
import AcademicPaper from "./AcademicPaper.vue"

const props = defineProps(["isPrintAll", "activeMode"])
const isPrintAll = ref(props?.isPrintAll || true)
// const activeMode = ref(props?.activeMode || "future-of-me")
// const activeMode = ref(props?.activeMode || "present-of-me")

const temp = inject('active-mode');
const activeMode = ref(temp || "future-of-me")

watchEffect(() => {
  console.log("active-mode", activeMode.value)
})

const activeTab = ref(0)

const futureOfMeTabs = [
]

const presentOfMeTabs = [
]

const pastOfMeTabs = [
]

const finalTabViewed = ref([])
// if (activeMode.value == "future-of-me") finalTabViewed.value = futureOfMeTabs;
// if (activeMode.value == "present-of-me") finalTabViewed.value = presentOfMeTabs;
// if (activeMode.value == "past-of-me") finalTabViewed.value = pastOfMeTabs;

// watch(finalTabViewed, (val) => {
//   console.log(val)
// })

import WrapperOfModernJS from "./explore-code/WrapperOfModernJS.vue"
import WrapperOfModernCSS from "./explore-code/WrapperOfModernCSS.vue"

const tabs = ref([
  // ...finalTabViewed.value


  { id: 0, label: "c-related", component: WelcomeCode },
  { id: 1, label: "rust-related", component: MonthlyChallenges },
  { id: 1, label: "modern-css", component: WrapperOfModernCSS },
  { id: 1, label: "modern-js", component: WrapperOfModernJS },
  { id: 1, label: "vue-related", component: "" },
  { id: 1, label: "vue-setter-getter", component: "" },
  { id: 1, label: "canvas-api", component: "" },
  // { id: 1, label: "-related", component: MonthlyChallenges },

  // { id: 1, label: "reader", component: PdfViewer },
  // { id: 1, label: "reader", component: AcademicPaper },
  // { id: 1, label: "article", component: ArticleView },
  // { id: 4, label: "headers", component: CodeDumpRelearnView },
  // { id: 5, label: "random", component: ProgrammingConceptView },
  // { id: 0, label: "profile", component: ProfileView },

  // { id: 2, label: "shapes", component: CanvasEngineDemo },
  // { id: 3, label: "charts", component: ChartContainer },
  // { id: 4, label: "animation", component: DashboardLayoutWrapper },
  // { id: 5, label: "math", component: CanvasEngineMath },
  // { id: 6, label: "physics", component: CanvasEnginePhysics },
  // { id: 7, label: "audio", component: CreativeLyrics },
  // { id: 8, label: "3d-related", component: ShapesThreeDimension },

  // { id: 2, label: "WEBGL", component: WebglExplorationView },
  // { id: 4, label: "Creative3D", component: Creative3DView },
  // { id: 7, label: "audio", component: CanvasEngineAudio },
  // { id: 4, label: "SIPENA (TM)", component: SipenaView },
  // { id: 0, label: "EASYBUDGET (TM)", component: EasyBudgetView },
  // { id: 1, label: "Theories", component: TheoryCollection },
  // { id: 2, label: "Articles", component: ArticleView },
  // { id: 3, label: "Gallery", component: CanvasExamplesView },
  // { id: 5, label: "Animation", component: MyAnimationView },
  // { id: 1, label: "Roadmap Gen", component: RoadmapContainer },
  // { id: 2, label: "Simulation", component: SimulationCenterView },


  // { id: 1, label: "FAQ", component: ClarityFAQ },
  // { id: 5, label: "THEORIES", component: GamePanelView },
  // { id: 6, label: "CREATIVE-2D", component: CreativeView },
  // { id: 7, label: "CREATIVE-3D", component: Creative3DView },

  // { id: 1, label: "Creative2D", component: CreativeView },
  // { id: 2, label: "MINDMAP-MAKER", component: MindmapMaker },
  // { id: 3, label: "CODING-AS-HOBBY", component: CodingAsHobbyView },
  // { id: 0, label: "PROFILE", component: ProfileView },
  // { id: 3, label: "C+LIBRARIES", component: ProgrammingConceptView },
  // { id: 0, label: "LINUX", component: CodeDumpRelearnView },
  // { id: 4, label: "FAQ", component: ClarityFAQ },
])

const setupWelcome = () => {
  // useTitle(computed(() => `${tabs.value[0]?.label} | naravisuals-web`))
  setQueryParams({ page: tabs.value[0]?.label }, true)
}

const changeRoute = (idx) => {
  activeTab.value = idx;


  tabs.value.map((page, id) => {
    if (id === idx) {
      refreshTheStore()

      // useTitle(computed(() => `${page.label} | naravisuals-web`))
      setQueryParams({ page: page.label }, true)
    }
  })

}

const store = useLocalStorage('store', {
  page: ''
})

const refreshTheStore = () => {
  const url = new URLManager()
  const currentPage = url.getParam('page')

  console.log("store-prev: ", store.value?.page)
  store.value = { page: currentPage }
  console.log("store-current: ", store.value?.page)
}


onMounted(() => {
  console.log("onMounted: ", store.value)

  const previousTab = tabs.value.filter(item => {
    if (item.label === store.value.page) {
      // useTitle(computed(() => `${item.label} | naravisuals-web`))

      return item.id
    }
  })

  const prevId = previousTab[0]?.id || 0
  console.log("prevId: ", prevId)

  if (prevId <= tabs.value.length) {
    activeTab.value = prevId
  } else {
    console.log("INVALID TAB-ID")
  }

})

</script>

<template>
  <div class="tabs-container dark">
    <!-- Tabs -->
    <div class="tabs no-print">
      <button v-for="(tab, index) in tabs" :key="index" :class="{ active: activeTab === index }"
        @click="changeRoute(index)">
        {{ tab.label }}
      </button>
    </div>

    <!-- Optional mobile dropdown -->
    <select class="tabs-dropdown no-print" v-model="activeTab" @change="setActiveUrl">
      <option v-for="(tab, index) in tabs" :key="index" :value="index">
        {{ tab.label }}
      </option>
    </select>

    <!-- Content -->
    <div v-if="!isPrintAll" class="tab-content">
      <component :is="tabs[activeTab].component"></component>
    </div>

    <div v-else>
      <!-- PRINT MODE -->
      <ProfileView />
      <hr />
      <CodeDumpRelearnView />
      <hr />
      <ArticleView />
      <hr />
      <CreativeView />
      <hr />
      <Creative3DView />
    </div>
  </div>
</template>

<style scoped>
/* Dark theme base */
.tabs-container.dark {
  background-color: #121212;
  color: #ffffff;
  /* min-height: 100vh; */
  margin-bottom: 200px;
}

/* Tabs row */
.tabs {
  display: flex;
  overflow-x: auto;
  /* allow horizontal scroll */
  -webkit-overflow-scrolling: touch;
  border-bottom: 2px solid #333;
  background-color: #1e1e1e;
}

/* Hide scrollbar but keep scroll functionality */
.tabs::-webkit-scrollbar {
  display: none;
}

/* Tab buttons */
.tabs button {
  flex: 0 0 auto;
  /* prevent squishing */
  padding: 12px 16px;
  cursor: pointer;
  background: none;
  border: none;
  color: #ffffff;
  border-bottom: 2px solid transparent;
  transition: background 0.3s;
  white-space: nowrap;
  /* keep labels intact */
}

.tabs button:hover {
  background-color: #2a2a2a;
}

.tabs button.active {
  border-bottom: 2px solid #42b983;
  font-weight: bold;
}

/* Mobile dropdown (hidden on desktop) */
.tabs-dropdown {
  display: none;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background-color: #1e1e1e;
  color: #ffffff;
  border: 1px solid #333;
}

@media (max-width: 600px) {
  .tabs {
    display: none;
    /* hide row on small screens */
  }

  .tabs-dropdown {
    display: block;
    /* show dropdown instead */
  }
}

/* Content area */
.tab-content {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ffffff;
}
</style>
