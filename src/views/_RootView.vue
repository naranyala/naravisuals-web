<script setup>

import {ref} from "vue"

import GhReposView from "./GhReposView.vue"
import ProfileView from "./ProfileView.vue"
import CreativeView from "./CreativeView.vue"
import Creative3DView from "./Creative3DView.vue"
import ArticleView from "./ArticleView.vue"

const activeTab = ref(0)
const tabs = ref([
        { label: "ARTICLES", component: ArticleView },
        { label: "CREATIVE-2D", component: CreativeView },
        { label: "CREATIVE-3D", component: Creative3DView },
        { label: "GH-REPOS", component: GhReposView },
        { label: "PROFILE", component: ProfileView },
      ]);
    
  const changeRoute = (idx) => {
        activeTab.value = idx
    }
</script>


<template>
  <div class="tabs-container dark">
    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: activeTab === index }"
        @click="changeRoute(index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <component :is="tabs[activeTab].component"></component>
    </div>

  </div>
</template>


<style scoped>
/* Dark theme base */
.tabs-container.dark {
  background-color: #121212; /* dark background */
  color: #ffffff;            /* white text */
  min-height: 100vh;
}

/* Tabs row */
.tabs {
  display: flex;
  border-bottom: 2px solid #333;
  background-color: #1e1e1e;
}

/* Tab buttons */
.tabs button {
  flex: 1;
  padding: 12px;
  cursor: pointer;
  background: none;
  border: none;
  color: #ffffff;
  border-bottom: 2px solid transparent;
  transition: background 0.3s;
}

.tabs button:hover {
  background-color: #2a2a2a;
}

.tabs button.active {
  border-bottom: 2px solid #42b983; /* Vue green accent */
  font-weight: bold;
}

/* Content area */
.tab-content {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ffffff;
}
</style>

