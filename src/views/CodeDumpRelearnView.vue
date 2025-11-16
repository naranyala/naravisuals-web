<script setup>
import { ref } from 'vue'

import FullScreenModal from "./reusables/FullScreenModal.vue"
import CodeBlock from "./reusables/CodeBlock.vue"

import strReactiveH from "./raw-files/reactive.h?raw"

const myLibraries = ref([
  { libName: "reactive.h", isOpen: false, code: strReactiveH },
  { libName: "str_builder.h", isOpen: false, code: ""},
  { libName: "dynamic_arr.h", isOpen: false, code: ""},
  { libName: "kv_store.h", isOpen: false, code: ""}
])


</script>

<template>
  <div class="projects-container" @keydown="handleKeydown">
    <h1 class="section-title">Our Projects</h1>

    <div style="display: flex;">
    <div v-for="item in myLibraries" :key="item.libName">
      <button @click="item.isOpen = true" style="margin: 10px;">{{item.libName}}</button>

  <FullScreenModal v-model="item.isOpen">
        <div style="margin-top: 60px;">
        <h2>{{item.libName}}</h2>

        <p style="margin: 20px 0; border: 1px solid gray; border-radius: 10px; padding: 10px;">lorem ipsum dolor</p>


            <CodeBlock language="c" :label="item.libName" :code="item.code"/>

        </div>
  </FullScreenModal>
    </div>
    </div>

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
