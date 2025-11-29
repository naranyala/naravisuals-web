<script setup>

import { ref, onMounted, watch, watchEffect, computed } from "vue"
import URLManager from "../utilities/URLManager.js"
import { useTitle } from "../composables.ts"
import useLocalStorage from "./composables/useLocalStorage.js"
import {
  saveCurrentUrl, restoreLastUrl, setQueryParams, getQueryParams
} from "./utils.js"

import MottoCollection from "./MottoCollection.vue"
import ExploreCrustView from "./ExploreCrustView.vue"
import JsVueExplorationMain from "./JsVueExplorationMain.vue"
import MyComponentExploration from "./MyComponentExploration.vue"

import CodeShowView from "./CodeShowView.vue"
import ProgrammingConceptView from "./ProgrammingConceptView.vue"
import CodeDumpRelearnView from "./CodeDumpRelearnView.vue"
import ProfileView from "./ProfileView.vue"
import GeneralFaqView from "./GeneralFaqView.vue"
import ClarityFAQ from "./ClarityFAQ.vue"
import BashScriptCollectionView from "./BashScriptCollectionView.vue"
import NeovimAndCliView from "./NeovimAndCliView.vue"
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
import CanvasEngineDemo from "./CanvasEngineDemo.vue"
import WebglExplorationView from "./WebglExplorationView.vue"

const props = defineProps(["isPrintAll"])
const isPrintAll = ref(props?.isPrintAll || true)

const activeTab = ref(0)
const tabs = ref([
  // { id: 4, label: "SIPENA (TM)", component: SipenaView },
  // { id: 0, label: "EASYBUDGET (TM)", component: EasyBudgetView },
  // { id: 0, label: "VisualsLyrics (TM)", component: CreativeLyrics },

  // { id: 1, label: "Theories", component: TheoryCollection },
  // { id: 2, label: "Articles", component: ArticleView },
  // { id: 3, label: "Gallery", component: CanvasExamplesView },
  // { id: 4, label: "Creative3D", component: Creative3DView },
  // { id: 5, label: "Animation", component: MyAnimationView },

  { id: 0, label: "WELCOME", component: MottoCollection },
  // { id: 1, label: "Roadmap Gen", component: RoadmapContainer },
  // { id: 1, label: "be-beyond", component: MyComponentExploration },
  { id: 1, label: "be-beyond", component: CanvasEngineDemo },
  { id: 2, label: "Simulation", component: SimulationCenterView },
  // { id: 2, label: "WEBGL", component: WebglExplorationView },
  { id: 3, label: "C/RUST", component: ExploreCrustView },
  { id: 4, label: "JS/VUE", component: JsVueExplorationMain },
  { id: 5, label: "CLI/NEOVIM", component: NeovimAndCliView },


  // { id: 1, label: "Creative2D", component: CreativeView },
  // { id: 2, label: "MINDMAP-MAKER", component: MindmapMaker },
  // { id: 3, label: "CODING-AS-HOBBY", component: CodingAsHobbyView },
  // { id: 0, label: "PROFILE", component: ProfileView },
  // { id: 3, label: "C+LIBRARIES", component: ProgrammingConceptView },
  // { id: 0, label: "LINUX", component: CodeDumpRelearnView },
  // { id: 4, label: "FAQ", component: ClarityFAQ },
])

const setupWelcome = () => {
  useTitle(computed(() => `${tabs.value[0]?.label} | naravisuals-web`))
  setQueryParams({ page: tabs.value[0]?.label }, true)
}

const changeRoute = (idx) => {
  activeTab.value = idx;


  tabs.value.map((page, id) => {
    if (id === idx) {
      refreshTheStore()

      useTitle(computed(() => `${page.label} | naravisuals-web`))
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
      useTitle(computed(() => `${item.label} | naravisuals-web`))

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
