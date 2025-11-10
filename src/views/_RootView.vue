<script setup>
import { ref } from "vue"

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
])

const changeRoute = (idx) => {
  activeTab.value = idx
}
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
    >
      <option v-for="(tab, index) in tabs" :key="index" :value="index">
        {{ tab.label }}
      </option>
    </select>

    <!-- Content -->
    <div class="tab-content">
      <component :is="tabs[activeTab].component"></component>
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
