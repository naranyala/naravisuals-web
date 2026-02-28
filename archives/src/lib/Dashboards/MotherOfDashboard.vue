<template>
  <div class="dashboard">
    <div class="header">
      <div>
        <h1>{{ title }}</h1>
        <div class="subtitle">{{ subtitle }}</div>
      </div>

      <div class="controls">
        <div class="search-wrapper">
          <input
            type="text"
            class="search"
            v-model="search"
            placeholder="Search..."
          >
          <button
            v-if="search"
            class="clear-btn"
            @click="search = ''"
          >
            ✕
          </button>
        </div>

        <div class="view-controls">
          <div class="btn-group">
            <button
              class="control-btn"
              :class="{ active: categoryLayout === 'grid' }"
              @click="categoryLayout = 'grid'"
            >
              ⊞
            </button>
            <button
              class="control-btn"
              :class="{ active: categoryLayout === 'list' }"
              @click="categoryLayout = 'list'"
            >
              ☰
            </button>
          </div>

          <div class="btn-group">
            <button
              class="control-btn"
              :class="{ active: appLayout === 'box' }"
              @click="appLayout = 'box'"
            >
              ⊡
            </button>
            <button
              class="control-btn"
              :class="{ active: appLayout === 'list' }"
              @click="appLayout = 'list'"
            >
              ≡
            </button>
          </div>
        </div>
      </div>
    </div>

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
            <div class="app-icon">{{ app.icon }}</div>
            <div class="app-name">{{ app.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        <h2>{{ selectedApp?.name }}</h2>
        <div class="modal-body">
          <!-- Empty content area -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const title = ref('Homelab');
const subtitle = ref('Dashboard');
const search = ref('');
const categoryLayout = ref('grid');
const appLayout = ref('box');
const showModal = ref(false);
const selectedApp = ref(null);

const categories = ref([
  {
    name: 'Media',
    apps: [
      { name: 'Jellyfin', icon: '📺' },
      { name: 'Plex', icon: '▶️' },
      { name: 'Airsonic', icon: '🎵' },
    ],
  },
  {
    name: 'Network',
    apps: [
      { name: 'Pi-Hole', icon: '🛡️' },
      { name: 'Monit', icon: '📊' },
    ],
  },
  {
    name: 'Monitor',
    apps: [
      { name: 'Grafana', icon: '📉' },
      { name: 'Prometheus', icon: '🔥' },
    ],
  },
  {
    name: 'Tools',
    apps: [
      { name: 'NextCloud', icon: '☁️' },
      { name: 'VS Code', icon: '💻' },
    ],
  },
]);

const filteredCategories = computed(() => {
  if (!search.value) return categories.value;

  return categories.value
    .map((cat) => ({
      ...cat,
      apps: cat.apps.filter((app) =>
        app.name.toLowerCase().includes(search.value.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.apps.length > 0);
});

const openModal = (app) => {
  selectedApp.value = app;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedApp.value = null;
};
</script>

<style scoped>
.dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0f172a;
  min-height: 100vh;
  padding: 16px;
  color: #e2e8f0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  margin: 0;
  color: #f1f5f9;
}

.subtitle {
  color: #64748b;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin-top: 4px;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 10px 40px 10px 16px;
  border-radius: 8px;
  color: #e2e8f0;
  width: 100%;
  min-width: 150px;
  max-width: 200px;
  outline: none;
  font-size: 14px;
}

.search::placeholder {
  color: #64748b;
}

.search:focus {
  border-color: #475569;
  background: #252f3f;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #e2e8f0;
  background: #334155;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.btn-group {
  display: flex;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.control-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  border-right: 1px solid #334155;
}

.control-btn:last-child {
  border-right: none;
}

.control-btn:hover {
  background: #252f3f;
  color: #cbd5e1;
}

.control-btn.active {
  background: #334155;
  color: #f1f5f9;
}

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

.app-box .app-icon {
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.app-list .app-icon {
  font-size: 1.5rem;
  margin-bottom: 0;
}

.app-name {
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.2;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  padding: 24px;
  position: relative;
  overflow: auto;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #0f172a;
  border: 1px solid #334155;
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #334155;
  color: #f1f5f9;
}

.modal-content h2 {
  color: #f1f5f9;
  margin: 0 0 24px 0;
  font-weight: 400;
  font-size: 1.8rem;
}

.modal-body {
  min-height: 400px;
  border: 2px dashed #334155;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.modal-body::before {
  content: 'Content area';
  font-size: 1.2rem;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .dashboard {
    padding: 12px;
  }

  .header {
    margin-bottom: 16px;
  }

  .controls {
    width: 100%;
    justify-content: space-between;
  }

  .search-wrapper {
    flex: 1;
    min-width: 0;
  }

  .search {
    max-width: 100%;
    min-width: 0;
  }

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

  .modal-content {
    width: 95vw;
    height: 95vh;
    padding: 16px;
  }

  .modal-content h2 {
    font-size: 1.4rem;
  }
}
</style>
