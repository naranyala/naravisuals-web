<template>
  <div class="mindmap-container">
    <div class="controls">
      <h2>Interactive Mindmap</h2>
      <div class="json-editor">
        <textarea v-model="jsonInput" placeholder="Enter mindmap JSON structure..." @input="validateJSON"></textarea>
        <div class="editor-footer">
          <span v-if="jsonError" class="error">{{ jsonError }}</span>
          <span v-else-if="nodes.length" class="success">✓ Valid JSON - {{ nodes.length }} nodes</span>
          <div class="button-group">
            <button @click="renderMindmap" :disabled="!!jsonError">Render Mindmap</button>
            <button @click="resetView" class="secondary">Reset View</button>
            <button @click="exportAsImage" class="secondary">Export as Image</button>
          </div>
        </div>
      </div>
      <div class="info">
        <p>💡 Drag to pan the entire mindmap | Scroll to zoom</p>
      </div>
    </div>
    <canvas ref="mindmapCanvas" class="mindmap-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MindMapCanvas } from '../utilities/mindmap.js';

// Component state
const mindmapCanvas = ref(null);
let mindmap = null;
const nodes = ref([]);
const jsonInput = ref('');
const jsonError = ref('');

// Dummy data
const dummyData = {
  nodes: [
    { text: 'Project', x: 400, y: 300, color: '#E74C3C' },
    { text: 'Planning', x: 250, y: 200, color: '#3498DB' },
    { text: 'Design', x: 250, y: 400, color: '#3498DB' },
    { text: 'Development', x: 550, y: 200, color: '#3498DB' },
    { text: 'Testing', x: 550, y: 400, color: '#3498DB' },
    { text: 'Research', x: 100, y: 150, color: '#2ECC71' },
    { text: 'Requirements', x: 100, y: 250, color: '#2ECC71' },
    { text: 'UI/UX', x: 100, y: 400, color: '#2ECC71' },
    { text: 'Prototypes', x: 100, y: 500, color: '#2ECC71' },
    { text: 'Frontend', x: 700, y: 150, color: '#F39C12' },
    { text: 'Backend', x: 700, y: 250, color: '#F39C12' },
  ],
  connections: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 0, to: 4 },
    { from: 1, to: 5 },
    { from: 1, to: 6 },
    { from: 2, to: 7 },
    { from: 2, to: 8 },
    { from: 3, to: 9 },
    { from: 3, to: 10 },
  ]
};

// Initialize mindmap with dummy data
const initializeMindmap = () => {
  if (!mindmapCanvas.value) {
    console.error('Canvas ref not found');
    return;
  }

  try {
    mindmap = new MindMapCanvas(mindmapCanvas.value, {
      nodeRadius: 40,
      nodeColor: '#4A90E2',
      fontSize: 14
    });

    // Set initial JSON in textarea
    jsonInput.value = JSON.stringify(dummyData, null, 2);

    // Render initial mindmap
    renderMindmapFromData(dummyData);
  } catch (error) {
    console.error('Failed to initialize mindmap:', error);
    return;
  }
};

const renderMindmapFromData = (data) => {
  if (!mindmap) return;

  // Clear existing mindmap
  mindmap.clear();

  // Add nodes
  const nodeMap = [];
  data.nodes.forEach(nodeData => {
    const node = mindmap.addNode(
      nodeData.text,
      nodeData.x,
      nodeData.y,
      { color: nodeData.color }
    );
    nodeMap.push(node);
  });

  // Add connections
  data.connections.forEach(conn => {
    mindmap.connect(nodeMap[conn.from].id, nodeMap[conn.to].id);
  });

  nodes.value = mindmap.nodes;

  // Center the mindmap after rendering with animation
  setTimeout(() => {
    mindmap.centerCanvas(true);
  }, 100);
};

// Validate JSON input
const validateJSON = () => {
  try {
    if (!jsonInput.value.trim()) {
      jsonError.value = 'JSON cannot be empty';
      return;
    }

    const data = JSON.parse(jsonInput.value);

    if (!data.nodes || !Array.isArray(data.nodes)) {
      jsonError.value = 'Missing or invalid "nodes" array';
      return;
    }

    if (!data.connections || !Array.isArray(data.connections)) {
      jsonError.value = 'Missing or invalid "connections" array';
      return;
    }

    // Validate node structure
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i];
      if (!node.text || typeof node.x !== 'number' || typeof node.y !== 'number') {
        jsonError.value = `Invalid node at index ${i}: must have text, x, and y`;
        return;
      }
    }

    jsonError.value = '';
  } catch (e) {
    jsonError.value = 'Invalid JSON syntax: ' + e.message;
  }
};

// Render mindmap from textarea
const renderMindmap = () => {
  try {
    const data = JSON.parse(jsonInput.value);
    renderMindmapFromData(data);
  } catch (e) {
    jsonError.value = 'Failed to render: ' + e.message;
  }
};

// Export mindmap as image
const exportAsImage = () => {
  if (!mindmap) return;
  mindmap.exportAsImage('mindmap.png');
};

// Reset view to default (centered, no zoom, all nodes visible)
const resetView = () => {
  if (!mindmap) return;
  mindmap.centerCanvas(true); // Animate to centered view with all nodes visible
};

// Lifecycle
onMounted(() => {
  // Use nextTick to ensure DOM is fully rendered
  setTimeout(() => {
    initializeMindmap();
  }, 0);
});

onUnmounted(() => {
  if (mindmap) {
    mindmap.destroy();
    mindmap = null;
  }
});
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.controls h2 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 24px;
}

.json-editor {
  margin-bottom: 15px;
}

.json-editor textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
}

.json-editor textarea:focus {
  border-color: #4A90E2;
}

.json-editor textarea.error {
  border-color: #E74C3C;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
  flex-wrap: wrap;
}

.editor-footer .button-group {
  display: flex;
  gap: 10px;
  margin: 0;
}

.error {
  color: #E74C3C;
  font-size: 14px;
  font-weight: 500;
}

.success {
  color: #2ECC71;
  font-size: 14px;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover {
  background: #357ABD;
}

button:active {
  transform: translateY(1px);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

button.secondary {
  background: #2ECC71;
}

button.secondary:hover {
  background: #27AE60;
}

.info {
  margin-top: 10px;
}

.info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.mindmap-canvas {
  flex: 1;
  width: 100%;
  cursor: move;
  cursor: grab;
  background: white;
}

.mindmap-canvas:active {
  cursor: grabbing;
}
</style>
