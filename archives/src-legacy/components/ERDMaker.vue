<template>
  <div class="erd-container">
    <div class="erd-header">
      <h2 class="erd-title">Entity Relationship Diagram Maker</h2>
      <p class="erd-subtitle">Design and visualize database schemas</p>
    </div>
    
    <div class="erd-toolbar">
      <div class="toolbar-group">
        <button @click="addEntity" class="toolbar-btn" title="Add Entity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          Entity
        </button>
        <button @click="addAttribute" class="toolbar-btn" title="Add Attribute" :disabled="!selectedEntity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Field
        </button>
        <button 
          @click="startRelationship" 
          class="toolbar-btn" 
          :class="{ active: relationshipMode }"
          title="Create Relationship"
          :disabled="entities.length < 2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
          Relate
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
          :disabled="!selectedEntity && !selectedRelation"
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

    <div class="erd-canvas" ref="canvasRef" @click="onCanvasClick" :class="{ 'relationship-mode': relationshipMode }">
      <div v-if="relationshipMode" class="relationship-hint">
        <span v-if="!relationshipSource">Click first entity to create relationship</span>
        <span v-else>Click second entity to complete</span>
      </div>
      <svg class="connections-svg" width="100%" height="100%">
        <path
          v-for="relation in relations"
          :key="relation.id"
          :d="getRelationPath(relation)"
          class="relation-line"
          :class="{ selected: selectedRelation?.id === relation.id }"
          @click.stop="selectRelation(relation)"
        />
        <text
          v-for="relation in relations"
          :key="'label-' + relation.id"
          :x="(getRelationMidpoint(relation).x)"
          :y="(getRelationMidpoint(relation).y)"
          class="relation-label"
          @click.stop="selectRelation(relation)"
        >
          {{ relation.type }}
        </text>
      </svg>
      
      <div
        v-for="entity in entities"
        :key="entity.id"
        :class="['erd-entity', { 
          selected: selectedEntity?.id === entity.id,
          'relationship-source': relationshipSource?.id === entity.id,
          'relationship-target': relationshipTarget?.id === entity.id
        }]"
        :style="{ left: entity.x + 'px', top: entity.y + 'px' }"
        @mousedown.stop="onEntityMouseDown($event, entity)"
        @click.stop="onEntityClick(entity)"
      >
        <div class="entity-header">{{ entity.name }}</div>
        <div class="entity-attributes">
          <div v-for="attr in entity.attributes" :key="attr.id" class="attribute">
            <span :class="['attr-type', attr.type]">{{ attr.type }}</span>
            <span class="attr-name">{{ attr.name }}</span>
            <button class="attr-delete" @click.stop="deleteAttribute(entity, attr.id)" title="Delete field">×</button>
          </div>
        </div>
      </div>
    </div>

    <div class="erd-info" v-if="entities.length === 0">
      <div class="empty-state">
        <div class="empty-icon">🗄️</div>
        <p>Start creating your ERD</p>
        <p class="empty-hint">Click "Entity" to add tables</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface EntityAttribute {
  id: string;
  name: string;
  type: 'PK' | 'FK' | 'UN' | '';
}

interface ERDEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  attributes: EntityAttribute[];
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: string;
}

const canvasRef = ref<HTMLElement | null>(null);
const entities = ref<ERDEntity[]>([
  { id: 'e1', name: 'Users', x: 50, y: 150, attributes: [
    { id: 'a1', name: 'id', type: 'PK' },
    { id: 'a2', name: 'email', type: 'UN' },
    { id: 'a3', name: 'password', type: '' },
  ]},
  { id: 'e2', name: 'Orders', x: 350, y: 150, attributes: [
    { id: 'b1', name: 'id', type: 'PK' },
    { id: 'b2', name: 'user_id', type: 'FK' },
    { id: 'b3', name: 'total', type: '' },
  ]},
]);
const relations = ref<Relationship[]>([{ id: 'r1', from: 'e1', to: 'e2', type: '1:n' }]);
const selectedEntity = ref<ERDEntity | null>(null);
const selectedRelation = ref<Relationship | null>(null);
const draggingEntity = ref<ERDEntity | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const relationshipMode = ref(false);
const relationshipSource = ref<ERDEntity | null>(null);
const relationshipTarget = ref<ERDEntity | null>(null);

const getEntityCenter = (id: string) => {
  const entity = entities.value.find(e => e.id === id);
  if (!entity) return { x: 0, y: 0 };
  return { x: entity.x + 100, y: entity.y + 40 + entity.attributes.length * 24 };
};

const getRelationPath = (relation: Relationship) => {
  const from = getEntityCenter(relation.from);
  const to = getEntityCenter(relation.to);
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
};

const getRelationMidpoint = (relation: Relationship) => {
  const from = getEntityCenter(relation.from);
  const to = getEntityCenter(relation.to);
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
};

const addEntity = () => {
  entities.value.push({
    id: `e${Date.now()}`,
    name: 'NewEntity',
    x: 200,
    y: 150,
    attributes: [{ id: `a${Date.now()}`, name: 'id', type: 'PK' }]
  });
  saveToLocalStorage();
};

const addAttribute = () => {
  if (!selectedEntity.value) return;
  const name = prompt('Field name:');
  if (!name) return;
  const type = prompt('Type (PK, FK, UN, or empty):', '') as 'PK' | 'FK' | 'UN' | '';
  selectedEntity.value.attributes.push({
    id: `attr${Date.now()}`,
    name,
    type: type === 'PK' || type === 'FK' || type === 'UN' ? type : ''
  });
  saveToLocalStorage();
};

const deleteAttribute = (entity: ERDEntity, attrId: string) => {
  entity.attributes = entity.attributes.filter(a => a.id !== attrId);
  saveToLocalStorage();
};

const startRelationship = () => {
  relationshipMode.value = !relationshipMode.value;
  if (!relationshipMode.value) {
    relationshipSource.value = null;
    relationshipTarget.value = null;
  }
};

const completeRelationship = () => {
  if (relationshipSource.value && relationshipTarget.value) {
    const types = ['1:1', '1:n', 'n:1', 'n:m'];
    const type = prompt(`Relationship type:\n${types.join(', ')}`, '1:n');
    if (type && types.includes(type)) {
      relations.value.push({
        id: `r${Date.now()}`,
        from: relationshipSource.value.id,
        to: relationshipTarget.value.id,
        type
      });
      saveToLocalStorage();
    }
    relationshipSource.value = null;
    relationshipTarget.value = null;
    relationshipMode.value = false;
  }
};

const onEntityClick = (entity: ERDEntity) => {
  if (relationshipMode.value) {
    if (!relationshipSource.value) {
      relationshipSource.value = entity;
    } else if (entity.id !== relationshipSource.value.id) {
      relationshipTarget.value = entity;
      completeRelationship();
    }
  } else {
    selectEntity(entity);
  }
};

const selectEntity = (entity: ERDEntity) => {
  selectedEntity.value = entity;
};

const selectRelation = (relation: Relationship) => {
  selectedRelation.value = relation;
};

const deleteSelected = () => {
  if (selectedRelation.value) {
    relations.value = relations.value.filter(r => r.id !== selectedRelation.value?.id);
    selectedRelation.value = null;
  } else if (selectedEntity.value) {
    const entId = selectedEntity.value.id;
    entities.value = entities.value.filter(e => e.id !== entId);
    relations.value = relations.value.filter(r => r.from !== entId && r.to !== entId);
    selectedEntity.value = null;
  }
  saveToLocalStorage();
};

const onEntityMouseDown = (e: MouseEvent, entity: ERDEntity) => {
  draggingEntity.value = entity;
  dragOffset.value = { x: e.clientX - entity.x, y: e.clientY - entity.y };
  selectEntity(entity);
};

const onCanvasClick = () => {
  selectedEntity.value = null;
};

const onMouseMove = (e: MouseEvent) => {
  if (draggingEntity.value) {
    draggingEntity.value.x = e.clientX - dragOffset.value.x;
    draggingEntity.value.y = e.clientY - dragOffset.value.y;
    saveToLocalStorage();
  }
};

const onMouseUp = () => {
  draggingEntity.value = null;
};

const clearCanvas = () => {
  if (confirm('Clear all entities?')) {
    entities.value = [];
    relations.value = [];
    selectedEntity.value = null;
    selectedRelation.value = null;
    localStorage.removeItem('erd-data');
  }
};

const saveToLocalStorage = () => {
  const data = { entities: entities.value, relations: relations.value };
  localStorage.setItem('erd-data', JSON.stringify(data));
};

const saveDiagram = () => {
  const data = { entities: entities.value, relations: relations.value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'erd-diagram-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('ERD saved to downloads!');
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
        entities.value = data.entities || [];
        relations.value = data.relations || [];
        saveToLocalStorage();
        alert('ERD loaded from: ' + file.name);
      } catch (err) {
        alert('Failed to load ERD file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('erd-data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      entities.value = data.entities || [];
      relations.value = data.relations || [];
    } catch (e) {
      console.log('Failed to load ERD from localStorage');
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
.erd-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.erd-header {
  margin-bottom: 1rem;
  text-align: center;
}

.erd-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.erd-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.erd-toolbar {
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

.toolbar-btn.active {
  background: rgba(88, 101, 242, 0.3);
  border-color: #5865f2;
}

.erd-canvas {
  flex: 1;
  background: rgba(26, 31, 46, 0.5);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: auto;
  min-height: 400px;
}

.relationship-mode {
  background: rgba(88, 101, 242, 0.05);
  border-color: rgba(88, 101, 242, 0.5) !important;
}

.relationship-hint {
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

.relation-line {
  fill: none;
  stroke: #5865f2;
  stroke-width: 2;
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.relation-line:hover {
  stroke-width: 3;
}

.relation-line.selected {
  stroke: #f0abfc;
  stroke-width: 3;
}

.relation-label {
  fill: #e4e6eb;
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  cursor: pointer;
  user-select: none;
}

.erd-entity {
  position: absolute;
  width: 200px;
  background: rgba(37, 44, 62, 0.95);
  border: 2px solid #5865f2;
  border-radius: 8px;
  cursor: move;
}

.erd-entity.selected {
  border-color: #7c3aed;
}

.erd-entity.relationship-source {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.erd-entity.relationship-target {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.entity-header {
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  border-radius: 6px 6px 0 0;
}

.entity-attributes {
  padding: 0.5rem;
}

.attribute {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid rgba(58, 66, 82, 0.3);
}

.attr-type {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
}

.attr-type.PK { background: rgba(88, 101, 242, 0.3); color: #a5b4fc; }
.attr-type.FK { background: rgba(251, 146, 60, 0.3); color: #fdba74; }
.attr-type.UN { background: rgba(34, 197, 94, 0.3); color: #86efac; }

.attr-name {
  color: #e4e6eb;
  font-size: 0.8rem;
  flex: 1;
}

.attr-delete {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.25rem;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}

.attribute:hover .attr-delete {
  opacity: 1;
}

.attr-delete:hover {
  color: #f87171;
}

.erd-info {
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
