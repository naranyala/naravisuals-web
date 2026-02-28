<template>
  <div class="app-container">
    <aside class="sidebar desktop-only">
      <div class="sidebar-header">
        <h1 class="sidebar-title">📊 Diagram Maker</h1>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-tab', { active: activeTab === tab.id }]"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>
    </aside>

    <main class="main-content">
      <div class="content-area">
        <div class="tab-content">
          <MarkdownEditor v-if="activeTab === 'markdown'" />
          <DFDMaker v-if="activeTab === 'dfd'" />
          <ERDMaker v-if="activeTab === 'erd'" />
          <MindMapMaker v-if="activeTab === 'mindmap'" />
        </div>
      </div>
    </main>

    <nav class="bottom-nav mobile-only">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['nav-tab', { active: activeTab === tab.id }]"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label-mobile">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MarkdownEditor from './components/MarkdownEditor.vue';
import DFDMaker from './components/DFDMaker.vue';
import ERDMaker from './components/ERDMaker.vue';
import MindMapMaker from './components/MindMapMaker.vue';

const activeTab = ref('markdown');

const tabs = [
  { id: 'markdown', label: 'Markdown', icon: '📝' },
  { id: 'dfd', label: 'DFD', icon: '🔄' },
  { id: 'erd', label: 'ERD', icon: '🗄️' },
  { id: 'mindmap', label: 'Mind Map', icon: '🧠' }
];
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3348 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Desktop Sidebar */
.sidebar {
  width: 280px;
  background: rgba(26, 31, 46, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(58, 66, 82, 0.3);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(58, 66, 82, 0.2);
}

.sidebar-title {
  color: #e4e6eb;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0;
  position: relative;
}

.nav-tab:hover {
  background: rgba(88, 101, 242, 0.1);
  color: #e4e6eb;
}

.nav-tab.active {
  background: rgba(88, 101, 242, 0.15);
  color: #5865f2;
  font-weight: 600;
}

.nav-tab.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  border-radius: 0 2px 2px 0;
}

.tab-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.tab-label {
  flex: 1;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
}

.content-area {
  padding: 2rem;
  min-height: 100vh;
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Mobile Bottom Navbar */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(26, 31, 46, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(58, 66, 82, 0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.bottom-nav .nav-tab {
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
  background: none;
  border-radius: 8px;
  color: #9ca3af;
  font-size: 0.75rem;
  min-height: 60px;
  justify-content: center;
}

.bottom-nav .nav-tab:hover {
  background: rgba(88, 101, 242, 0.1);
  color: #e4e6eb;
}

.bottom-nav .nav-tab.active {
  background: rgba(88, 101, 242, 0.15);
  color: #5865f2;
}

.bottom-nav .nav-tab.active::before {
  display: none;
}

.bottom-nav .tab-icon {
  font-size: 1.2rem;
  width: auto;
  margin-bottom: 0.125rem;
}

.tab-label-mobile {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
}

/* Responsive Design */

/* Desktop styles (769px and up) */
@media (min-width: 769px) {
  .sidebar {
    display: flex !important; /* Ensure sidebar is visible */
  }

  .main-content {
    margin-left: 280px;
  }

  .bottom-nav {
    display: none;
  }

  .content-area {
    padding: 2rem;
  }
}

/* Tablet styles (769px to 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .nav-tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

/* Mobile styles (768px and down) */
@media (max-width: 768px) {
  .sidebar {
    display: none !important; /* Ensure sidebar is hidden */
  }

  .main-content {
    margin-left: 0 !important; /* Ensure no margin on mobile */
    padding-bottom: 80px; /* Space for bottom nav */
    width: 100% !important; /* Full width */
  }

  .content-area {
    padding: 1rem 0.75rem;
    width: 100% !important; /* Full width */
    max-width: none !important; /* No max-width constraint */
  }

  .bottom-nav {
    display: flex !important; /* Ensure bottom nav is visible */
  }
}

/* Small mobile (480px and down) */
@media (max-width: 480px) {
  .content-area {
    padding: 0.75rem 0.5rem;
  }

  .bottom-nav {
    padding: 0.25rem;
  }

  .bottom-nav .nav-tab {
    min-height: 55px;
    padding: 0.375rem 0.125rem;
  }

  .bottom-nav .tab-icon {
    font-size: 1.1rem;
  }

  .tab-label-mobile {
    font-size: 0.65rem;
  }
}

/* Large desktop (1400px and up) */
@media (min-width: 1400px) {
  .sidebar {
    width: 320px;
  }

  .main-content {
    margin-left: 320px;
  }

  .content-area {
    padding: 2.5rem 3rem;
  }
}
</style>