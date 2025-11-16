<script setup>

import { ref, onMounted, watch, watchEffect, computed} from "vue"
import URLManager from "./utilities/URLManager.js"
import {useTitle} from "../composables.ts"
import useLocalStorage from "./composables/useLocalStorage.js"
import { 
  saveCurrentUrl, restoreLastUrl, setQueryParams, getQueryParams 
} from "./utils.js"

import ProgrammingConceptView from "./ProgrammingConceptView.vue"
import CodeDumpRelearnView from "./CodeDumpRelearnView.vue"
import ProfileView from "./ProfileView.vue"
import CreativeView from "./CreativeView.vue"
import Creative3DView from "./Creative3DView.vue"
import ArticleView from "./ArticleView.vue"
// import GeneralFaqView from "./GeneralFaqView.vue"
import VueComposablesView from "./VueComposablesView.vue"
import ClarityFAQ from "./ClarityFAQ.vue"

const props = defineProps(["isPrintAll"])
const isPrintAll = ref(props?.isPrintAll || true)

const activeTab = ref(0)
const tabs = ref([
  { id: 0, label: "PROFILE", component: ProfileView },
  { id: 1, label: "FAQ", component: ClarityFAQ },
  { id: 2, label: "ARTICLES", component: ArticleView },
  { id: 3, label: "COMPOSABLES", component: VueComposablesView },
  { id: 4, label: "SEGFAULT", component: CodeDumpRelearnView },
  { id: 5, label: "THEORIES", component: ProgrammingConceptView },
  // { id: 6, label: "CREATIVE-2D", component: CreativeView },
  // { id: 7, label: "CREATIVE-3D", component: Creative3DView },
])

const setupWelcome = () => {
    useTitle(computed(() => `${tabs.value[0]?.label} | naravisuals-web`))
    setQueryParams({ page: tabs.value[0]?.label }, true)
}

const changeRoute = (idx) => {
  activeTab.value = idx;


  tabs.value.map((page, id) => {
    if(id === idx) {
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
    if(item.label === store.value.page){
      useTitle(computed(() => `${item.label} | naravisuals-web`))

      return item.id
    }
  })

  const prevId = previousTab[0]?.id || 0
  console.log("prevId: ", prevId)

  if(prevId <= tabs.value.length){
    activeTab.value = prevId
  }else {
    console.log("INVALID TAB-ID")
  }

})

</script>

<template>
  <div class="tabs-container dark">
    <!-- Tabs -->
    <div class="tabs no-print">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: activeTab === index }"
        @click="changeRoute(index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Optional mobile dropdown -->
    <select
      class="tabs-dropdown no-print"
      v-model="activeTab"
      @change="setActiveUrl"
    >
      <option v-for="(tab, index) in tabs" :key="index" :value="index">
        {{ tab.label }}
      </option>
    </select>

    <!-- Content -->
    <div v-if="!isPrintAll" class="tab-content">
      <component :is="tabs[activeTab].component"></component>
    </div>
    <div v-else>
      <ProfileView/>
      <hr/>
      <CodeDumpRelearnView/>
      <hr/>
      <ArticleView/>
      <hr/>
      <CreativeView/>
      <hr/>
      <Creative3DView/>
    </div>
  </div>
</template>

<style scoped>
/* Dark theme base */
.tabs-container.dark {
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
}

/* Tabs row */
.tabs {
  display: flex;
  overflow-x: auto;       /* allow horizontal scroll */
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
  flex: 0 0 auto;         /* prevent squishing */
  padding: 12px 16px;
  cursor: pointer;
  background: none;
  border: none;
  color: #ffffff;
  border-bottom: 2px solid transparent;
  transition: background 0.3s;
  white-space: nowrap;    /* keep labels intact */
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
    display: none;        /* hide row on small screens */
  }
  .tabs-dropdown {
    display: block;       /* show dropdown instead */
  }
}

/* Content area */
.tab-content {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ffffff;
}
</style>
