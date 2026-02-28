
<template>
  <div class="mindmap-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">−</button>
      <button @click="resetView">Reset</button>
      <button @click="exportAsImage">Export PNG</button>
    </div>

    <!-- SVG Canvas -->
    <svg
      ref="svgRef"
      :width="width"
      :height="height"
      class="mindmap-svg"
      @wheel.prevent="onWheel"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
    >
      <g :transform="transform">
        <!-- Edges -->
        <line
          v-for="edge in edges"
          :key="edge.from + edge.to"
          :x1="getNode(edge.from).x"
          :y1="getNode(edge.from).y"
          :x2="getNode(edge.to).x"
          :y2="getNode(edge.to).y"
          :stroke="theme.edge"
          stroke-width="2"
        />

        <!-- Nodes -->
        <g
          v-for="node in nodes"
          :key="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
        >
          <rect
            x="-80"
            y="-28"
            width="160"
            height="56"
            rx="10"
            :fill="theme.nodeBg"
            :stroke="theme.nodeBorder"
            stroke-width="2"
          />
          <text
            class="node-text"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ node.label }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

/* =========================================================
   Constants
========================================================= */
const width = 1200;
const height = 800;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

/* =========================================================
   Theme (Dark by Default)
========================================================= */
const theme = {
  nodeBg: 'var(--bg-node)',
  nodeBorder: 'var(--border-node)',
  edge: 'var(--edge-color)',
};

/* =========================================================
   Data Model (Learning Roadmap)
========================================================= */
const nodes = [
  { id: 'vue', label: 'Vue 3 Core', x: 0, y: 0 },
  { id: 'reactivity', label: 'Reactivity', x: -300, y: -140 },
  { id: 'composition', label: 'Composition API', x: -300, y: 140 },
  { id: 'router', label: 'Vue Router', x: 300, y: -140 },
  { id: 'state', label: 'State Management', x: 300, y: 140 },
  { id: 'tooling', label: 'Vite & Tooling', x: 0, y: 260 },
];

const edges = [
  { from: 'vue', to: 'reactivity' },
  { from: 'vue', to: 'composition' },
  { from: 'vue', to: 'router' },
  { from: 'vue', to: 'state' },
  { from: 'vue', to: 'tooling' },
];

const getNode = (id) => nodes.find((n) => n.id === id);

/* =========================================================
   View State (Zoom + Pan)
========================================================= */
const view = reactive({
  x: width / 2,
  y: height / 2,
  scale: 1,
});

const transform = computed(
  () => `translate(${view.x}, ${view.y}) scale(${view.scale})`,
);

/* =========================================================
   Zoom Controls
========================================================= */
const zoomIn = () => {
  view.scale = Math.min(MAX_SCALE, view.scale * 1.15);
};

const zoomOut = () => {
  view.scale = Math.max(MIN_SCALE, view.scale / 1.15);
};

const resetView = () => {
  view.x = width / 2;
  view.y = height / 2;
  view.scale = 1;
};

const onWheel = (e) => {
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
};

/* =========================================================
   Pan Controls
========================================================= */
let panning = false;
const last = { x: 0, y: 0 };

const startPan = (e) => {
  panning = true;
  last.x = e.clientX;
  last.y = e.clientY;
};

const pan = (e) => {
  if (!panning) return;
  view.x += e.clientX - last.x;
  view.y += e.clientY - last.y;
  last.x = e.clientX;
  last.y = e.clientY;
};

const endPan = () => {
  panning = false;
};

/* =========================================================
   Export SVG → PNG
========================================================= */
const svgRef = ref(null);

const exportAsImage = () => {
  const svg = svgRef.value;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const blob = new Blob([source], {
    type: 'image/svg+xml;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const link = document.createElement('a');
    link.download = 'vue-learning-roadmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = url;
};
</script>

<style scoped>
/* =========================================================
   Dark Theme Tokens
========================================================= */
:root {
  --bg-primary: #020617;
  --bg-node: #0f172a;
  --border-node: #38bdf8;
  --edge-color: #64748b;
  --text-primary: #e5e7eb;
  --button-border: #334155;
}

/* =========================================================
   Layout
========================================================= */
.mindmap-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 12px;
  user-select: none;
}

.toolbar {
  margin-bottom: 10px;
}

button {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--button-border);
  padding: 6px 10px;
  margin-right: 6px;
  cursor: pointer;
}

button:hover {
  background: #020617;
}

.mindmap-svg {
  display: block;
  background: var(--bg-primary);
}

/* =========================================================
   SVG Text
========================================================= */
.node-text {
  fill: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
}
</style>
