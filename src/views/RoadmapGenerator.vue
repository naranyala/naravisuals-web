<template>
  <div class="container">
    <div class="panel">
      <h2>JSON Input</h2>
      <textarea v-model="jsonInput"></textarea>
      <button @click="generateMindmap">Generate Mindmap</button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div class="panel">
      <h2>Mindmap</h2>
      <canvas ref="canvas" width="800" height="600"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const defaultData = {
  name: "Vue.js",
  children: [
    {
      name: "Core",
      children: [
        { name: "Reactivity" },
        { name: "Components" }
      ]
    },
    {
      name: "Composition API",
      children: [
        { name: "setup()" },
        { name: "ref" }
      ]
    },
    {
      name: "Ecosystem",
      children: [
        { name: "Router" },
        { name: "Pinia" }
      ]
    }
  ]
};

const jsonInput = ref(JSON.stringify(defaultData, null, 2));
const mindmapData = ref(defaultData);
const error = ref('');
const canvas = ref(null);

const generateMindmap = () => {
  try {
    mindmapData.value = JSON.parse(jsonInput.value);
    error.value = '';
    drawMindmap();
  } catch (e) {
    error.value = 'Invalid JSON: ' + e.message;
  }
};

const drawMindmap = () => {
  const ctx = canvas.value.getContext('2d');
  const width = canvas.value.width;
  const height = canvas.value.height;

  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  drawNode(ctx, mindmapData.value, centerX, centerY, 0);
};

const drawNode = (ctx, node, x, y, level) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
  const color = colors[level % colors.length];

  ctx.font = '14px Arial';
  const textWidth = ctx.measureText(node.name).width;
  const width = textWidth + 20;
  const height = 30;

  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);

  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.name, x, y);

  if (node.children) {
    const radius = 100;
    const angleStep = (Math.PI * 2) / node.children.length;

    node.children.forEach((child, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const childX = x + Math.cos(angle) * radius;
      const childY = y + Math.sin(angle) * radius;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(childX, childY);
      ctx.stroke();

      drawNode(ctx, child, childX, childY, level + 1);
    });
  }
};

onMounted(() => {
  drawMindmap();
});
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.panel {
  flex: 1;
  padding: 20px;
}

textarea {
  width: 100%;
  height: calc(100% - 80px);
  font-family: monospace;
  padding: 10px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  cursor: pointer;
}

canvas {
  border: 1px solid #ccc;
  width: 100%;
  height: calc(100% - 60px);
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
