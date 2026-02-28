<script setup>
import { computed, ref } from 'vue';
import ComponentRegistry from './lib/ComponentRegistry.vue';
import ArticleManager from './lib/Content/ArticleManager.vue';

const currentMode = ref('components');
const modeOptions = [
  { id: 'components', label: 'Component Demos' },
  { id: 'articles', label: 'Articles' },
];

const search = ref('');
const categoryLayout = ref('grid');
const appLayout = ref('box');
const showModal = ref(false);
const selectedApp = ref(null);

const componentRegistryRef = ref(null);

const openModal = (app) => {
  selectedApp.value = app;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedApp.value = null;
};

const getComponent = (name) => {
  return componentRegistryRef.value?.getComponent(name);
};

const currentLabel = computed(() => {
  const opt = modeOptions.find((o) => o.id === currentMode.value);
  return opt ? opt.label : '';
});
</script>

<template>
  <div class="dashboard">
    <div class="header">
      <div class="mode-selector">
        <h1 class="main-title">Naravisuals</h1>
        <div class="mode-dropdown">
          <select v-model="currentMode" class="mode-select">
            <option v-for="opt in modeOptions" :key="opt.id" :value="opt.id">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="toolbar" v-if="currentMode === 'components'">
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

    <!-- Components Mode -->
    <div v-if="currentMode === 'components'">
      <ComponentRegistry
        ref="componentRegistryRef"
        :search="search"
        :category-layout="categoryLayout"
        :app-layout="appLayout"
        @open-modal="openModal"
      />
    </div>

    <!-- Articles Mode -->
    <ArticleManager
      v-else
      :search="search"
    />

    <!-- Modal -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        <h2>{{ selectedApp?.name }}</h2>
        <div class="modal-body">
          <component :is="getComponent(selectedApp?.name)" v-if="selectedApp" />
        </div>
      </div>
    </div>
  </div>
</template>

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

.mode-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  margin: 0;
  color: #f1f5f9;
}

.mode-dropdown {
  position: relative;
}

.mode-select {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 8px 32px 8px 12px;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  appearance: none;
  min-width: 150px;
}

.mode-select:focus {
  border-color: #475569;
  background: #252f3f;
}

.mode-dropdown::after {
  content: '▼';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #64748b;
  pointer-events: none;
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

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

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
  display: flex;
  flex-direction: column;
}

.modal-body :deep(*) {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 12px;
  }

  .header {
    margin-bottom: 12px;
  }

  .toolbar {
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