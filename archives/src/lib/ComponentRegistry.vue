<script setup>
import { computed, ref } from 'vue';

// Auto-scan components from folders - eager imports to avoid warnings
import ArticleManager from './Content/ArticleManager.vue';
import ArticleReader from './Content/ArticleReader.vue';
import ContentExample from './Content/ContentExample.vue';
import MarkdownRenderer from './Content/MarkdownRenderer.vue';
import MotherOfDashboard from './Dashboards/MotherOfDashboard.vue';
import MotherOfDashboardUseCase from './Dashboards/MotherOfDashboardUseCase.vue';
import ChartExploration from './Data-Display/ChartExploration.vue';
import FullFeaturedTable from './Data-Display/FullFeaturedTable.vue';
import BlockBasedEditor from './Editors/BlockBasedEditor.vue';
import LibCprogrammingCollection from './Programming/LibCprogrammingCollection.vue';
import LibRustCollection from './Programming/LibRustCollection.vue';
import Roadmap from './Roadmaps/Roadmap.vue';
import Roadmap2 from './Roadmaps/Roadmap2.vue';

const componentModules = {
  // Content
  'Content/ArticleReader.vue': ArticleReader,
  'Content/ContentExample.vue': ContentExample,
  'Content/MarkdownRenderer.vue': MarkdownRenderer,
  'Content/ArticleManager.vue': ArticleManager,

  // Data Display
  'Data-Display/FullFeaturedTable.vue': FullFeaturedTable,
  'Data-Display/ChartExploration.vue': ChartExploration,

  // Editors
  'Editors/BlockBasedEditor.vue': BlockBasedEditor,

  // Programming
  'Programming/LibCprogrammingCollection.vue': LibCprogrammingCollection,
  'Programming/LibRustCollection.vue': LibRustCollection,

  // Dashboards
  'Dashboards/MotherOfDashboard.vue': MotherOfDashboard,
  'Dashboards/MotherOfDashboardUseCase.vue': MotherOfDashboardUseCase,

  // Roadmaps
  'Roadmaps/Roadmap.vue': Roadmap,
  'Roadmaps/Roadmap2.vue': Roadmap2,
};

const props = defineProps({
  search: String,
  categoryLayout: String,
  appLayout: String,
});

const emit = defineEmits(['openModal']);

const componentCache = new Map();

const componentRegistry = computed(() => {
  const components = [];

  for (const [path, component] of Object.entries(componentModules)) {
    // Extract category from folder name and component name from file name
    const match = path.match(/^([^/]+)\/([^/]+)$/);

    if (!match) {
      console.error('Invalid path format:', path);
      continue;
    }

    const [, folderName, fileName] = match;

    // Convert folder name to readable category name
    const categoryName = folderName.replace(/-/g, ' ');

    // Convert file name to readable component name
    const componentName = fileName
      .replace('.vue', '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    components.push({
      name: componentName,
      category: categoryName,
      component: component,
    });
  }

  // Sort by category, then by name
  return components.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
});

const categories = computed(() => {
  return Object.entries(
    componentRegistry.value.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {}),
  ).map(([name, apps]) => ({ name, apps }));
});

const filteredCategories = computed(() => {
  if (!props.search) return categories.value;

  return categories.value
    .map((cat) => ({
      ...cat,
      apps: cat.apps.filter((app) =>
        app.name.toLowerCase().includes(props.search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.apps.length > 0);
});

const openModal = (app) => {
  componentCache.set(app.name, app.component);
  emit('openModal', app);
};

const getComponent = (name) => componentCache.get(name);

defineExpose({
  getComponent,
});
</script>

<template>
  <div class="grid" :class="`layout-${categoryLayout}`">
    <div
      class="section"
      v-for="category in filteredCategories"
      :key="category.name"
    >
      <div class="section-title">{{ category.name }}</div>
      <div class="apps" :class="`apps-${appLayout}`">
        <div
          class="app"
          :class="`app-${appLayout}`"
          v-for="app in category.apps"
          :key="app.name"
          @click="openModal(app)"
        >
          <div class="app-name">{{ app.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 16px;
}

.grid.layout-list {
  grid-template-columns: 1fr;
  max-width: 1000px;
}

.section {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #334155;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 12px;
  color: #cbd5e1;
  font-weight: 500;
}

.apps {
  display: grid;
  gap: 10px;
}

.apps-box {
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
}

.apps-list {
  grid-template-columns: 1fr;
  gap: 8px;
}

.app {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-box {
  padding: 16px 12px;
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.app-list {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.app:hover {
  background: #1e293b;
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.app-list:hover {
  transform: translateX(4px);
}

.app:active {
  transform: translateY(0);
}

.app-list:active {
  transform: translateX(0);
}

.app-name {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .section {
    padding: 12px;
  }

  .apps-box {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .app-box {
    padding: 12px 8px;
    min-height: 70px;
  }
}
</style>