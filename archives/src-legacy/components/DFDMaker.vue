<template>
  <div class="dfd-container">
    <div class="dfd-header">
      <h2 class="dfd-title">Data Flow Diagram Maker</h2>
      <p class="dfd-subtitle">Create and visualize data flow diagrams</p>
    </div>
    
    <div class="dfd-toolbar">
      <div class="toolbar-group">
        <button @click="addProcess" class="toolbar-btn" title="Add Process">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Process
        </button>
        <button @click="addDataStore" class="toolbar-btn" title="Add Data Store">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          Data Store
        </button>
        <button @click="addExternalEntity" class="toolbar-btn" title="Add External Entity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Entity
        </button>
        <button 
          @click="startConnection" 
          class="toolbar-btn" 
          :class="{ active: connectionMode }"
          title="Connect Elements"
          :disabled="elements.length < 2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
          Connect
        </button>
      </div>
      <div class="toolbar-group">
        <button @click="clearCanvas" class="toolbar-btn danger" title="Clear Canvas">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Clear
        </button>
        <button 
          @click="deleteSelected" 
          class="toolbar-btn danger" 
          title="Delete Selected"
          :disabled="!selectedElement && !selectedFlow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
        <button @click="loadDiagram" class="toolbar-btn" title="Load Diagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Load
        </button>
        <button @click="saveDiagram" class="toolbar-btn" title="Save Diagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save
        </button>
      </div>
    </div>

    <div class="dfd-canvas" ref="canvasRef" @click="onCanvasClick" :class="{ 'connection-mode': connectionMode }">
      <div v-if="connectionMode" class="connection-hint">
        <span v-if="!connectionSource">Click an element to start connection</span>
        <span v-else>Click another element to complete connection</span>
      </div>
      <svg class="connections-svg" width="100%" height="100%">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#5865f2"/>
          </marker>
        </defs>
        <path
          v-for="flow in flows"
          :key="flow.id"
          :d="getFlowPath(flow)"
          class="connection-line"
          :class="{ selected: selectedFlow?.id === flow.id }"
          @click.stop="selectFlow(flow)"
        />
      </svg>
      
      <div
        v-for="element in elements"
        :key="element.id"
        :class="['dfd-element', element.type, { 
          selected: selectedElement?.id === element.id,
          'connection-source': connectionSource?.id === element.id,
          'connection-target': connectionTarget?.id === element.id
        }]"
        :style="{ left: element.x + 'px', top: element.y + 'px' }"
        @mousedown.stop="onElementMouseDown($event, element)"
        @click.stop="onElementClick(element)"
      >
        <div class="element-label">{{ element.label }}</div>
      </div>
    </div>

    <div class="dfd-info" v-if="elements.length === 0">
      <div class="empty-state">
        <div class="empty-icon">🔄</div>
        <p>Start creating your DFD</p>
        <p class="empty-hint">Click buttons above to add elements</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface DFDElement {
  id: string;
  type: 'process' | 'datastore' | 'entity';
  x: number;
  y: number;
  label: string;
}

interface DataFlow {
  id: string;
  from: string;
  to: string;
  label: string;
}

const canvasRef = ref<HTMLElement | null>(null);
const elements = ref<DFDElement[]>([]);
const flows = ref<DataFlow[]>([]);
const selectedElement = ref<DFDElement | null>(null);
const selectedFlow = ref<DataFlow | null>(null);
const draggingElement = ref<DFDElement | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const connectionMode = ref(false);
const connectionSource = ref<DFDElement | null>(null);
const connectionTarget = ref<DFDElement | null>(null);

const getElementCenter = (id: string) => {
  const el = elements.value.find(e => e.id === id);
  if (!el) return { x: 0, y: 0 };
  const width = el.type === 'process' ? 120 : el.type === 'datastore' ? 100 : 80;
  const height = el.type === 'process' ? 60 : el.type === 'datastore' ? 70 : 50;
  return { x: el.x + width / 2, y: el.y + height / 2 };
};

const getFlowPath = (flow: DataFlow) => {
  const from = getElementCenter(flow.from);
  const to = getElementCenter(flow.to);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`;
};

const addProcess = () => {
  elements.value.push({ id: `p${Date.now()}`, type: 'process', x: 200, y: 150, label: 'Process' });
};

const addDataStore = () => {
  elements.value.push({ id: `d${Date.now()}`, type: 'datastore', x: 400, y: 150, label: 'Store' });
};

const addExternalEntity = () => {
  elements.value.push({ id: `e${Date.now()}`, type: 'entity', x: 100, y: 150, label: 'Entity' });
};

const selectElement = (element: DFDElement) => {
  if (connectionMode.value) {
    if (!connectionSource.value) {
      connectionSource.value = element;
    } else if (element.id !== connectionSource.value.id) {
      connectionTarget.value = element;
      completeConnection();
    }
  } else {
    selectedElement.value = element;
  }
};

const onElementClick = (element: DFDElement) => {
  selectElement(element);
};

const startConnection = () => {
  connectionMode.value = !connectionMode.value;
  if (!connectionMode.value) {
    connectionSource.value = null;
    connectionTarget.value = null;
  }
};

const completeConnection = () => {
  if (connectionSource.value && connectionTarget.value) {
    const flowLabel = prompt('Enter flow label (optional):');
    flows.value.push({
      id: `f${Date.now()}`,
      from: connectionSource.value.id,
      to: connectionTarget.value.id,
      label: flowLabel || 'data'
    });
    connectionSource.value = null;
    connectionTarget.value = null;
    connectionMode.value = false;
    saveToLocalStorage();
  }
};

const selectFlow = (flow: DataFlow) => {
  selectedFlow.value = flow;
};

const deleteSelected = () => {
  if (selectedFlow.value) {
    flows.value = flows.value.filter(f => f.id !== selectedFlow.value?.id);
    selectedFlow.value = null;
  } else if (selectedElement.value) {
    const elId = selectedElement.value.id;
    elements.value = elements.value.filter(e => e.id !== elId);
    flows.value = flows.value.filter(f => f.from !== elId && f.to !== elId);
    selectedElement.value = null;
  }
  saveToLocalStorage();
};

const onElementMouseDown = (e: MouseEvent, element: DFDElement) => {
  draggingElement.value = element;
  dragOffset.value = { x: e.clientX - element.x, y: e.clientY - element.y };
  selectElement(element);
};

const onCanvasClick = () => {
  selectedElement.value = null;
};

const onMouseMove = (e: MouseEvent) => {
  if (draggingElement.value) {
    draggingElement.value.x = e.clientX - dragOffset.value.x;
    draggingElement.value.y = e.clientY - dragOffset.value.y;
    saveToLocalStorage();
  }
};

const onMouseUp = () => {
  draggingElement.value = null;
};

const clearCanvas = () => {
  if (confirm('Clear all elements and flows?')) {
    elements.value = [];
    flows.value = [];
    selectedElement.value = null;
    selectedFlow.value = null;
    localStorage.removeItem('dfd-data');
  }
};

const saveToLocalStorage = () => {
  const data = { elements: elements.value, flows: flows.value };
  localStorage.setItem('dfd-data', JSON.stringify(data));
};

const saveDiagram = () => {
  const data = { elements: elements.value, flows: flows.value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dfd-diagram-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('Diagram saved to downloads!');
};

const loadDiagram = () => {
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
        elements.value = data.elements || [];
        flows.value = data.flows || [];
        saveToLocalStorage();
        alert('Diagram loaded from: ' + file.name);
      } catch (err) {
        alert('Failed to load diagram file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('dfd-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      elements.value = data.elements || [];
      flows.value = data.flows || [];
    } catch (e) {
      console.log('Failed to load DFD from localStorage');
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
.dfd-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.dfd-header {
  margin-bottom: 1rem;
  text-align: center;
}

.dfd-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dfd-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.dfd-toolbar {
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

.toolbar-btn:hover {
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.5);
}

.toolbar-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
  color: #f87171;
}

.toolbar-btn.active {
  background: rgba(88, 101, 242, 0.3);
  border-color: #5865f2;
}

.dfd-canvas {
  flex: 1;
  background: rgba(26, 31, 46, 0.5);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: auto;
  min-height: 400px;
}

.connection-mode {
  background: rgba(88, 101, 242, 0.05);
  border-color: rgba(88, 101, 242, 0.5) !important;
}

.connection-hint {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(88, 101, 242, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 100;
  pointer-events: none;
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
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.connection-line:hover {
  stroke-width: 3;
}

.connection-line.selected {
  stroke: #f0abfc;
  stroke-width: 3;
}

.dfd-element {
  position: absolute;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
}

.dfd-element:hover {
  z-index: 10;
}

.dfd-element.selected {
  z-index: 20;
  box-shadow: 0 0 0 3px #7c3aed;
}

.dfd-element.connection-source {
  box-shadow: 0 0 0 3px #10b981;
}

.dfd-element.connection-target {
  box-shadow: 0 0 0 3px #f59e0b;
}

.dfd-element.process {
  width: 120px;
  height: 60px;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  border-radius: 8px;
}

.dfd-element.datastore {
  width: 100px;
  height: 70px;
  background: #2d3748;
  border: 2px solid #5865f2;
  border-radius: 4px;
}

.dfd-element.entity {
  width: 80px;
  height: 50px;
  background: #2d3748;
  border: 2px solid #5865f2;
  border-radius: 25px;
}

.element-label {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
}

.dfd-info {
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
