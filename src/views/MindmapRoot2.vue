<template>
  <div class="mindmap-container">
    <div class="controls">
      <h2>✨ Beautiful Interactive Mindmap</h2>
      <div class="json-editor">
        <textarea 
          v-model="jsonInput" 
          placeholder="Paste your mindmap JSON here..."
          @input="validateJSON"
        ></textarea>
        <div class="editor-footer">
          <span v-if="jsonError" class="error">{{ jsonError }}</span>
          <span v-else class="success">✓ Valid • {{ nodes.length }} nodes loaded</span>
          <div class="button-group">
            <button @click="renderMindmap" :disabled="!!jsonError">Render</button>
            <button @click="exportAsImage" class="secondary">Export PNG</button>
          </div>
        </div>
      </div>
      <div class="info">
        <p>🖱️ Drag to pan • Scroll to zoom • Hover boxes for focus</p>
      </div>
    </div>
    <canvas ref="mindmapCanvas" class="mindmap-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MindMapCanvas } from '../utilities/mindmap.js';

const mindmapCanvas = ref(null);
let mindmap = null;
const nodes = ref([]);
const jsonInput = ref('');
const jsonError = ref('');

const dummyData = {
  nodes: [
    { text: "Creative Project", x: 400, y: 300, color: "#8B5CF6" },
    { text: "Ideation", x: 200, y: 180, color: "#3B82F6" },
    { text: "Research", x: 150, y: 380, color: "#10B981" },
    { text: "Design System", x: 350, y: 480, color: "#F59E0B" },
    { text: "Prototype", x: 600, y: 150, color: "#EF4444" },
    { text: "User Testing", x: 650, y: 350, color: "#EC4899" },
    { text: "Launch!", x: 750, y: 500, color: "#14B8A6" }
  ],
  connections: [
    { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 },
    { from: 0, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }
  ]
};

const initializeMindmap = () => {
  if (!mindmapCanvas.value) return;

  // Configuration to reinforce the boxy style
  mindmap = new MindMapCanvas(mindmapCanvas.value, {
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", 
    primaryColor: '#1e3a8a', 
    nodeBorderRadius: 10,
    curveIntensity: 0.15,
    lineWidth: 5,
    textWeight: '800',
    fontSize: 18
  });

  jsonInput.value = JSON.stringify(dummyData, null, 2);
  renderMindmapFromData(dummyData);
};

const renderMindmapFromData = (data) => {
  if (!mindmap) return;
  mindmap.clear();
  
  const nodeMap = [];
  data.nodes.forEach(n => {
    const node = mindmap.addNode(n.text, n.x, n.y, {
      // Use the color from dummyData, but fallback to the boxy primary color
      color: n.color || "#1e3a8a" 
    });
    nodeMap.push(node);
  });

  data.connections.forEach(c => {
    mindmap.connect(nodeMap[c.from].id, nodeMap[c.to].id);
  });

  nodes.value = mindmap.nodes;
  // Removed call to centerCanvas
};

const validateJSON = () => {
  try {
    if (!jsonInput.value.trim()) throw "Empty";
    const data = JSON.parse(jsonInput.value);
    if (!Array.isArray(data.nodes) || !Array.isArray(data.connections)) 
      throw "Missing nodes/connections";
    jsonError.value = '';
  } catch (e) {
    jsonError.value = e.message || 'Invalid JSON';
  }
};

const renderMindmap = () => {
  try {
    const data = JSON.parse(jsonInput.value);
    renderMindmapFromData(data);
  } catch (e) {
    jsonError.value = 'Render failed: ' + e.message;
  }
};

const exportAsImage = () => mindmap?.exportAsImage('structured-mindmap.png');
// Removed resetView function

onMounted(() => setTimeout(initializeMindmap, 100));
onUnmounted(() => mindmap?.destroy());
</script>

<style scoped>
.mindmap-container { 
  /* height: 100vh;  */
  height: 1000px;
  display: flex; flex-direction: column; overflow: hidden; 
}
.controls { 
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); 
  padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 10;
}
h2 { 
  margin: 0 0 16px; font-size: 28px; 
  /* Adjusted gradient for a structured, serious look */
  background: linear-gradient(90deg, #1e3a8a, #0369a1); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  font-weight: 800;
}
.json-editor textarea { height: 180px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: 'JetBrains Mono', monospace; }
.json-editor textarea:focus { border-color: #1e3a8a; box-shadow: 0 0 0 4px rgba(30,58,138,0.2); }
button { 
  padding: 10px 20px; border-radius: 8px; font-weight: 700; transition: all 0.2s;
  background-color: #1e3a8a; color: white; border: none;
}
button.secondary { background-color: #f1f5f9; color: #1e3a8a; border: 1px solid #cbd5e1; }
button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(30,58,138,0.2); }
button.secondary:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
button:active { transform: translateY(0); }
button:disabled { opacity: 0.5; transform: none !important; }
.success { color: #047857; font-weight: 600; }
.error { color: #b91c1c; font-weight: 600; }
.info p { margin: 12px 0 0; color: #475569; font-weight: 500; }
.mindmap-canvas { flex: 1; background: #f8fafc; }
</style>
