
<template>
  <div class="toolbar">
    <button @click="zoomIn">Zoom +</button>
    <button @click="zoomOut">Zoom -</button>
    <button @click="resetZoom">Reset</button>
    <button @click="exportPng">Export PNG</button>
  </div>

  <svg
    ref="svgRef"
    :width="width"
    :height="height"
    viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    style="border:1px solid #ccc; background:#fafafa"
  >
    <!-- Connections -->
    <line x1="400" y1="200" x2="200" y2="400" stroke="#999" />
    <line x1="400" y1="200" x2="600" y2="400" stroke="#999" />
    <line x1="400" y1="200" x2="400" y2="600" stroke="#999" />

    <!-- Nodes -->
    <g v-for="node in nodes" :key="node.id">
      <rect
        :x="node.x"
        :y="node.y"
        rx="10"
        ry="10"
        width="200"
        height="60"
        fill="#fff"
        stroke="#333"
      />
      <text
        :x="node.x + 100"
        :y="node.y + 35"
        text-anchor="middle"
        font-size="14"
        fill="#111"
      >{{ node.label }}</text>
    </g>
  </svg>
</template>

<script setup>
import { reactive, ref } from 'vue';

const width = 1000;
const height = 800;

const svgRef = ref(null);

// ViewBox state (for zoom & pan)
const viewBox = reactive({
  x: 0,
  y: 0,
  w: width,
  h: height,
});

const nodes = ref([
  { id: 1, x: 300, y: 150, label: 'JavaScript Fundamentals' },
  { id: 2, x: 100, y: 380, label: 'HTML / CSS' },
  { id: 3, x: 500, y: 380, label: 'Vue Core (Reactivity, SFC)' },
  { id: 4, x: 300, y: 580, label: 'Ecosystem (Router, Pinia)' },
]);

// Zoom controls
function zoom(factor) {
  const dw = viewBox.w * (factor - 1);
  const dh = viewBox.h * (factor - 1);
  viewBox.x -= dw / 2;
  viewBox.y -= dh / 2;
  viewBox.w *= factor;
  viewBox.h *= factor;
}

const zoomIn = () => zoom(0.9);
const zoomOut = () => zoom(1.1);
const resetZoom = () => {
  viewBox.x = 0;
  viewBox.y = 0;
  viewBox.w = width;
  viewBox.h = height;
};

// Mouse wheel zoom
function onWheel(e) {
  const factor = e.deltaY < 0 ? 0.9 : 1.1;
  zoom(factor);
}

// Pan handling
let isPanning = false;
const last = { x: 0, y: 0 };

function onMouseDown(e) {
  isPanning = true;
  last.x = e.offsetX;
  last.y = e.offsetY;
}

function onMouseMove(e) {
  if (!isPanning) return;
  const dx = (e.offsetX - last.x) * (viewBox.w / width);
  const dy = (e.offsetY - last.y) * (viewBox.h / height);
  viewBox.x -= dx;
  viewBox.y -= dy;
  last.x = e.offsetX;
  last.y = e.offsetY;
}

function onMouseUp() {
  isPanning = false;
}

// Export SVG to PNG
function exportPng() {
  const svg = svgRef.value;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const img = new Image();
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const a = document.createElement('a');
    a.download = 'vue-learning-roadmap.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  img.src = url;
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
button {
  margin-right: 6px;
}
</style>
