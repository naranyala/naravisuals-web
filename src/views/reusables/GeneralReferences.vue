
<template>
  <div class="reference-section">
    <h2 class="title">References</h2>

    <ul class="reference-list">
      <li
        v-for="ref in refs"
        :key="ref.id"
        class="reference-item"
        @click="open(ref)"
      >
        {{ ref.label }}
      </li>
    </ul>

    <!-- Overlay -->
    <div
      v-if="show"
      class="overlay"
      @click="close"
    ></div>

    <!-- Sliding-Up Modal -->
    <div
      v-if="show"
      class="modal"
      :class="{ 'modal-open': show }"
    >
      <button class="close-btn" @click="close">×</button>
      <h3 class="modal-title">{{ active.label }}</h3>
      <p class="modal-content">{{ active.content }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const refs = [
  { id: 1, label: "What is WebGL?", content: "WebGL is a JavaScript API for rendering 3D graphics…" },
  { id: 2, label: "What is WASM?", content: "WebAssembly (WASM) is a binary instruction format…" },
  { id: 3, label: "What is Leaflet.js?", content: "Leaflet is a lightweight open-source map library…" }
];

const show = ref(false);
const active = ref({});

function open(refItem) {
  active.value = refItem;
  show.value = true;
}

function close() {
  show.value = false;
}
</script>

<style scoped>
/* --- DARK THEME BASE --- */
.reference-section {
 /* position: fixed; */
  margin-top: 200px;
  display: sticky;
  height: 100%;
  bottom: 0;
  padding: 40px;
  background: #0f0f0f;
  color: #ddd;
  padding-bottom: 200px;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 14px;
  font-weight: bold;
  text-decoration: underline;
}

/* --- Reference list --- */
.reference-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reference-item {
  padding: 8px 0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  color: #c9c9c9;
}

.reference-item:hover {
  color: #fff;
  text-decoration: underline;
}

/* --- Overlay --- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 998;
}

/* --- Modal --- */
.modal {
  z-index: 999;
  position: fixed;
  left: 0;
  right: 0;
  bottom: -320px;
  background: #1a1a1a;
  padding: 20px;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.45);
  transition: bottom 0.3s ease-out;
  max-height: 50vh;
  overflow-y: auto;
  color: #ddd;
}

@media (width < 600px){
  .modal {
    position: fixed;
    left: 40px;
    right: 40px;
    border-radius: 18px 18px 0 0;
  }
}

@media (width > 600px){
  .modal {
    position: fixed;
    left: 300px;
    right: 40px;
    border-radius: 18px 18px 0 0;
  }
}

@media (min-width: 900px) and (min-width: 1200px) {
  .modal {
    position: fixed;
    left: 300px;
    right: 40px;
    border-radius: 18px 18px 0 0;
  }
}


.modal-open {
  bottom: 0;
}

/* Close button */
.close-btn {
  position: absolute;
  right: 16px;
  top: 10px;
  border: none;
  background: none;
  color: #aaa;
  font-size: 26px;
  cursor: pointer;
  transition: color 0.2s ease;
}
.close-btn:hover {
  color: #fff;
}

.modal-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #fff;
}

.modal-content {
  line-height: 1.5;
  color: #cfcfcf;
}
</style>
