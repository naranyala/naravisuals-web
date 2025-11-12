<script setup>
import { ref } from 'vue'

import GhReposAccordion from "./GhReposAccordion.vue"

// Flat data source with external URLs
const flatProjects = [
  { title: "NaraVisuals Web", type: "Random", rating: 4.2, url: "https://github.com/naranyala/naravisuals-web" },
  { title: "Modular Dotfiles", type: "Random", rating: 4.9, url: "https://github.com/naranyala/modular-dotfiles" },
  { title: "Google", type: "", rating: 3.5, url: "https://google.com" },
  { title: "Project Delta", type: "", rating: 4.6, url: "https://example.com/project-delta" },
  { title: "Project Epsilon", type: "", rating: 4.1, url: "https://example.com/project-epsilon" },
  { title: "Project Zeta", type: "", rating: 4.8, url: "https://example.com/project-zeta" },
]

// Grouping logic
const groupsMap = {
  5: { title: "Top Rated", items: [] },
  4: { title: "Highly Recommended", items: [] },
  3: { title: "Good Effort", items: [] }
}

flatProjects.forEach(item => {
  if (item.rating >= 4.5) groupsMap[5].items.push(item)
  else if (item.rating >= 3.5) groupsMap[4].items.push(item)
  else groupsMap[3].items.push(item)
})

const sortedGroups = [groupsMap[5], groupsMap[4], groupsMap[3]].filter(g => g.items.length > 0)

// Modal state
const modalUrl = ref('')
const isModalOpen = ref(false)
const isLoading = ref(true)

// Open modal preview
const openPreview = (url) => {
  if (!url) return
  modalUrl.value = url
  isModalOpen.value = true
  isLoading.value = true
}

// Close modal
const closeModal = () => {
  isModalOpen.value = false
  modalUrl.value = ''
  isLoading.value = true
}

// Fallback: open in new tab (right-click or Ctrl+click still works)
const openLinkNewTab = (url) => {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

// Keyboard support
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isModalOpen.value) closeModal()
}
</script>

<template>
  <div class="projects-container" @keydown="handleKeydown">
    <h1 class="section-title">Our Projects</h1>

    <!-- <GhReposAccordion/> -->

    <div class="projects-grid">
      <div v-for="(group, groupIndex) in sortedGroups" :key="groupIndex" class="project-group">
        <h2 class="group-title">{{ group.title }}</h2>
        <div class="group-cards">
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            class="project-card"
            role="button"
            tabindex="0"
            @click.prevent="openPreview(item.url)"
            @contextmenu.prevent="openLinkNewTab(item.url)"
            @keydown.enter.prevent="openPreview(item.url)"
            @keydown.space.prevent="openPreview(item.url)"
          >
            <h3 class="project-name">{{ item.title }}</h3>
            <p class="project-type">{{ item.type }}</p>
            <span class="preview-hint">Click to preview • Right-click to open in new tab</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-panel" role="dialog" aria-modal="true" @click.stop>
            <!-- Header -->
            <div class="modal-header">
              <h3>Preview: {{ modalUrl }}</h3>
              <button class="close-btn" @click="closeModal" aria-label="Close preview">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Iframe Container -->
            <div class="iframe-wrapper">
              <div v-if="isLoading" class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading preview...</p>
              </div>
              <iframe
                :src="modalUrl"
                frameborder="0"
                @load="isLoading = false"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                loading="lazy"
              ></iframe>
            </div>

            <!-- Footer Actions -->
            <div class="modal-footer">
              <button @click="openLinkNewTab(modalUrl)" class="open-external-btn">
                Open in New Tab →
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background-color: #121212;
  color: #fff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.project-group {
  padding: 1rem;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.group-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.project-card {
  background-color: #1e1e1e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.7);
  background-color: #252525;
}

.project-card:focus {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}

.project-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.project-type {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.preview-hint {
  font-size: 0.75rem;
  color: #888;
  display: block;
  margin-top: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.project-card:hover .preview-hint {
  opacity: 1;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.modal-panel {
  width: 95vw;
  height: 95vh;
  max-width: 1400px;
  max-height: 900px;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1rem 1.5rem;
  background: #252525;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  font-size: 1.1rem;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.iframe-wrapper {
  position: relative;
  flex: 1;
  background: #000;
}

.iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  z-index: 10;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #333;
  border-top: 4px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-footer {
  padding: 1rem;
  background: #252525;
  text-align: right;
  border-top: 1px solid #333;
}

.open-external-btn {
  background: #60a5fa;
  color: #000;
  font-weight: 600;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.open-external-btn:hover {
  background: #93bbfc;
}

/* Modal Transition */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.9);
}

/* Mobile */
@media (max-width: 600px) {
  .projects-container { padding: 1rem; }
  .section-title { font-size: 1.5rem; }
  .group-cards { grid-template-columns: 1fr; }
  .modal-panel { width: 100vw; height: 100vh; border-radius: 0; }
  .modal-header h3 { font-size: 0.9rem; }
}
</style>
