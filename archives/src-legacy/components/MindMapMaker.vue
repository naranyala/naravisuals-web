<template>
  <div class="mindmap-container">
    <div class="mindmap-header">
      <h2 class="mindmap-title">Mind Map Maker</h2>
      <p class="mindmap-subtitle">Create and organize ideas visually</p>
    </div>
    
    <div class="mindmap-toolbar">
      <div class="toolbar-group">
        <button @click="addRootNode" class="toolbar-btn" title="Add Root Node">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Root
        </button>
        <button @click="addChildNode" class="toolbar-btn" title="Add Child Node" :disabled="!selectedNode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Child
        </button>
        <button @click="deleteNode" class="toolbar-btn danger" title="Delete Selected" :disabled="!selectedNode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      </div>
      <div class="toolbar-group">
        <button @click="changeColor" class="toolbar-btn" title="Change Color" :disabled="!selectedNode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="13.5" cy="6.5" r="2.5"/>
            <circle cx="19" cy="13" r="2.5"/>
            <circle cx="17" cy="20" r="2.5"/>
            <circle cx="8" cy="20" r="2.5"/>
            <circle cx="5" cy="13" r="2.5"/>
          </svg>
          Color
        </button>
        <button @click="clearCanvas" class="toolbar-btn danger" title="Clear All">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          </svg>
          Clear
        </button>
      </div>
      <div class="toolbar-group">
        <button @click="loadMindMap" class="toolbar-btn" title="Load Mind Map">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Load
        </button>
        <button @click="saveMindMap" class="toolbar-btn" title="Save Mind Map">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save
        </button>
      </div>
    </div>

    <div class="mindmap-canvas" ref="canvasRef" @click="onCanvasClick">
      <svg class="connections-svg" width="100%" height="100%">
        <path v-for="conn in nodeConnections" :key="conn.id" :d="getConnectionPath(conn)" class="connection-line"/>
      </svg>
      
      <div
        v-for="node in nodes"
        :key="node.id"
        :class="['mindmap-node', { selected: selectedNode?.id === node.id, root: node.isRoot }]"
        :style="{ left: node.x + 'px', top: node.y + 'px', backgroundColor: node.color }"
        @mousedown.stop="onNodeMouseDown($event, node)"
        @click.stop="selectNode(node)"
      >
        <input v-model="node.text" @input="onNodeTextChange" class="node-input" placeholder="Enter text..." />
      </div>
    </div>

    <div class="mindmap-info" v-if="nodes.length === 0">
      <div class="empty-state">
        <div class="empty-icon">🧠</div>
        <p>Start creating your mind map</p>
        <p class="empty-hint">Click "Root" to add the main idea</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isRoot: boolean;
  parentId: string | null;
  children: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const colors = ['#5865f2', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
const canvasRef = ref<HTMLElement | null>(null);

const nodes = ref<MindMapNode[]>([]);
const selectedNode = ref<MindMapNode | null>(null);
const draggingNode = ref<MindMapNode | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

const rootPosition = { x: 400, y: 50 };

const nodeConnections = computed(() => {
  const result: Connection[] = [];
  for (const node of nodes.value) {
    if (node.parentId) {
      result.push({ id: `conn-${node.id}`, from: node.parentId, to: node.id });
    }
  }
  return result;
});

const getConnectionPath = (conn: Connection) => {
  const fromNode = nodes.value.find(n => n.id === conn.from);
  const toNode = nodes.value.find(n => n.id === conn.to);
  if (!fromNode || !toNode) return '';
  const fromX = fromNode.x + 75;
  const fromY = fromNode.y + 25;
  const toX = toNode.x + 75;
  const toY = toNode.y + 25;
  const midY = (fromY + toY) / 2;
  return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
};

const addRootNode = () => {
  if (nodes.value.some(n => n.isRoot)) {
    alert('Root node already exists!');
    return;
  }
  const root: MindMapNode = {
    id: `node-${Date.now()}`,
    text: 'Main Idea',
    x: rootPosition.x - 75,
    y: rootPosition.y,
    color: colors[0],
    isRoot: true,
    parentId: null,
    children: []
  };
  nodes.value.push(root);
  selectedNode.value = root;
  saveToLocalStorage();
};

const addChildNode = () => {
  if (!selectedNode.value) return;
  const parent = selectedNode.value;
  const childCount = nodes.value.filter(n => n.parentId === parent.id).length;
  const newX = parent.x + (childCount % 2 === 0 ? 200 : -200);
  const newY = parent.y + 80 + (Math.floor(childCount / 2) * 70);
  const child: MindMapNode = {
    id: `node-${Date.now()}`,
    text: 'New Idea',
    x: newX,
    y: newY,
    color: colors[(childCount + 1) % colors.length],
    isRoot: false,
    parentId: parent.id,
    children: []
  };
  nodes.value.push(child);
  parent.children.push(child.id);
  selectedNode.value = child;
  saveToLocalStorage();
};

const deleteNode = () => {
  if (!selectedNode.value) return;
  if (selectedNode.value.isRoot) {
    if (!confirm('Delete root? This clears everything.')) return;
    nodes.value = [];
    selectedNode.value = null;
    return;
  }
  const nodeToDelete = selectedNode.value;
  const allIdsToDelete = [nodeToDelete.id, ...getAllChildren(nodeToDelete.id).map(c => c.id)];
  nodes.value = nodes.value.filter(n => !allIdsToDelete.includes(n.id));
  if (nodeToDelete.parentId) {
    const parent = nodes.value.find(n => n.id === nodeToDelete.parentId);
    if (parent) parent.children = parent.children.filter(id => id !== nodeToDelete.id);
  }
  selectedNode.value = null;
  saveToLocalStorage();
};

const getAllChildren = (nodeId: string): MindMapNode[] => {
  const node = nodes.value.find(n => n.id === nodeId);
  if (!node) return [];
  let children: MindMapNode[] = [];
  for (const childId of node.children) {
    const child = nodes.value.find(n => n.id === childId);
    if (child) {
      children.push(child);
      children = [...children, ...getAllChildren(childId)];
    }
  }
  return children;
};

const changeColor = () => {
  if (!selectedNode.value) return;
  const currentIndex = colors.indexOf(selectedNode.value.color);
  const nextIndex = (currentIndex + 1) % colors.length;
  selectedNode.value.color = colors[nextIndex];
  saveToLocalStorage();
};

const selectNode = (node: MindMapNode) => {
  selectedNode.value = node;
};

const onNodeMouseDown = (e: MouseEvent, node: MindMapNode) => {
  selectedNode.value = node;
  draggingNode.value = node;
  dragOffset.value = { x: e.clientX - node.x, y: e.clientY - node.y };
};

const onNodeTextChange = () => {};

const onCanvasClick = (e: MouseEvent) => {
  if (e.target === canvasRef.value || (e.target as HTMLElement).classList.contains('connections-svg')) {
    selectedNode.value = null;
  }
};

const onMouseMove = (e: MouseEvent) => {
  if (draggingNode.value) {
    draggingNode.value.x = e.clientX - dragOffset.value.x;
    draggingNode.value.y = e.clientY - dragOffset.value.y;
    saveToLocalStorage();
  }
};

const onMouseUp = () => {
  draggingNode.value = null;
};

const saveToLocalStorage = () => {
  const data = { nodes: nodes.value };
  localStorage.setItem('mindmap-data', JSON.stringify(data));
};

const clearCanvas = () => {
  if (confirm('Clear all nodes?')) {
    nodes.value = [];
    selectedNode.value = null;
    localStorage.removeItem('mindmap-data');
  }
};

const saveMindMap = () => {
  saveToLocalStorage();
  const data = { nodes: nodes.value, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindmap-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('Mind map saved to downloads!');
};

const loadMindMap = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        nodes.value = data.nodes || [];
        saveToLocalStorage();
        alert('Mind map loaded from: ' + file.name);
      } catch (err) {
        alert('Failed to load mind map file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('mindmap-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      nodes.value = data.nodes || [];
    } catch (e) {
      console.log('Failed to load mind map from localStorage');
    }
  }
};

onMounted(() => {
  loadFromLocalStorage();
});

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
</script>

<style scoped>
.mindmap-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.mindmap-header {
  margin-bottom: 1rem;
  text-align: center;
}

.mindmap-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mindmap-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.mindmap-toolbar {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(37, 44, 62, 0.8);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 6px;
  color: #e4e6eb;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.5);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
  color: #f87171;
}

.mindmap-canvas {
  flex: 1;
  background: rgba(26, 31, 46, 0.5);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: auto;
  min-height: 400px;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.connection-line {
  fill: none;
  stroke: #5865f2;
  stroke-width: 2;
  opacity: 0.6;
}

.mindmap-node {
  position: absolute;
  min-width: 150px;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: move;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s;
}

.mindmap-node:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.mindmap-node.selected {
  box-shadow: 0 0 0 3px #5865f2, 0 6px 16px rgba(0, 0, 0, 0.4);
}

.mindmap-node.root {
  border-radius: 12px;
  min-width: 180px;
}

.node-input {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  outline: none;
}

.node-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.mindmap-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.empty-state {
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
