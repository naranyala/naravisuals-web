<!-- src/components/RoadmapWithPanel.vue -->
<template>
  <div class="roadmap-wrapper">
    <!-- Roadmap Scene with Fixed Width -->
    <div class="roadmap-scene">
      <svg class="roadmap-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <path
          v-for="conn in connections"
          :key="`path-${conn.from}-${conn.to}`"
          :d="getPathData(conn)"
          :class="{
            'connection-locked': !isConnectionUnlocked(conn),
            'connection-unlocked': isConnectionUnlocked(conn)
          }"
          stroke-width="3"
          fill="none"
        />
      </svg>

      <div
        v-for="node in nodes"
        :key="node.id"
        class="roadmap-node"
        :class="{
          locked: !node.unlocked,
          completed: node.completed,
          current: node.id === selectedNode?.id
        }"
        :style="{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 500) * 100}%` }"
        @click="selectNode(node)"
      >
        <div class="node-inner">
          <div class="node-label">{{ node.label }}</div>
        </div>
      </div>
    </div>

    <!-- Info Panel - Always Visible -->
    <div class="info-panel">
      <div class="panel-header">
        <h3>{{ selectedNode?.label || 'Select a Node' }}</h3>
        <div v-if="selectedNode" class="node-status">
          <span v-if="selectedNode.completed" class="badge badge-completed">Completed</span>
          <span v-else-if="selectedNode.unlocked" class="badge badge-unlocked">Available</span>
          <span v-else class="badge badge-locked">Locked</span>
        </div>
      </div>
      
      <div class="panel-content">
        <p class="description">
          {{ selectedNode?.description || 'Click on any node to view its details and track your progress.' }}
        </p>
        
        <div v-if="selectedNode && selectedNode.tooltip" class="tooltip-section">
          <strong>Quick Info:</strong>
          <p>{{ selectedNode.tooltip }}</p>
        </div>
      </div>
      
      <div class="panel-actions">
        <button 
          v-if="selectedNode && !selectedNode.completed && selectedNode.unlocked" 
          @click="completeNode(selectedNode)"
          class="btn-complete"
        >
          ✓ Mark as Completed
        </button>
        <button 
          v-else-if="selectedNode && selectedNode.completed"
          @click="uncompleteNode(selectedNode)"
          class="btn-uncomplete"
        >
          ↺ Mark as Incomplete
        </button>
        <div v-else-if="selectedNode && !selectedNode.unlocked" class="locked-message">
          Complete previous nodes to unlock
        </div>
      </div>
      
      <!-- Progress Stats -->
      <div class="progress-stats">
        <div class="stat-item">
          <span class="stat-label">Completed:</span>
          <span class="stat-value">{{ completedCount }} / {{ nodes.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Progress:</span>
          <span class="stat-value">{{ progressPercentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// === Nodes with descriptions ===
const nodes = ref([
  { 
    id: 'start', 
    label: 'Start', 
    x: 100, 
    y: 250, 
    unlocked: true, 
    completed: false, 
    tooltip: 'Begin your journey', 
    description: 'Welcome to your learning roadmap! This is where your journey begins. Click the button below to mark this as complete and unlock the next steps.' 
  },
  { 
    id: 'a1', 
    label: 'Vue Fundamentals', 
    x: 250, 
    y: 150, 
    unlocked: false, 
    completed: false, 
    tooltip: 'Learn reactivity & components', 
    description: 'Master Vue 3 composition API, reactive refs, computed properties, and component communication. Build your foundation in modern Vue development.' 
  },
  { 
    id: 'b1', 
    label: 'Core Concepts', 
    x: 250, 
    y: 350, 
    unlocked: false, 
    completed: false, 
    tooltip: 'Essential patterns', 
    description: 'Understand fundamental programming patterns, component architecture, and best practices for building maintainable applications.' 
  },
  { 
    id: 'a2', 
    label: 'Pinia', 
    x: 450, 
    y: 120, 
    unlocked: false, 
    completed: false, 
    tooltip: 'State management', 
    description: 'Learn to manage complex application state with Pinia. Implement stores, actions, and getters for scalable Vue applications.' 
  },
  { 
    id: 'b2', 
    label: 'Advanced Patterns', 
    x: 450, 
    y: 380, 
    unlocked: false, 
    completed: false, 
    tooltip: 'Complex architectures', 
    description: 'Dive into advanced architectural patterns, middleware, async operations, and performance optimization techniques.' 
  },
  { 
    id: 'final', 
    label: 'Deploy', 
    x: 700, 
    y: 250, 
    unlocked: false, 
    completed: false, 
    tooltip: 'Ship to production', 
    description: 'Learn deployment strategies, CI/CD pipelines, and production best practices. Deploy your application to Vercel, Netlify, or your preferred hosting platform!' 
  }
])

const connections = [
  { from: 'start', to: 'a1' },
  { from: 'start', to: 'b1' },
  { from: 'a1', to: 'a2' },
  { from: 'b1', to: 'b2' },
  { from: 'a2', to: 'final' },
  { from: 'b2', to: 'final' }
]

const selectedNode = ref(null)

// === Computed Properties ===
const completedCount = computed(() => {
  return nodes.value.filter(n => n.completed).length
})

const progressPercentage = computed(() => {
  return Math.round((completedCount.value / nodes.value.length) * 100)
})

// === Helper Functions ===
const getNodeById = (id) => nodes.value.find(n => n.id === id)

const isConnectionUnlocked = (conn) => {
  const fromNode = getNodeById(conn.from)
  return fromNode?.completed || fromNode?.id === 'start'
}

const getPathData = (conn) => {
  const from = getNodeById(conn.from)
  const to = getNodeById(conn.to)
  if (!from || !to) return ''
  
  const dx = to.x - from.x
  const dy = to.y - from.y
  
  // Create smooth bezier curve
  const cx1 = from.x + dx * 0.4
  const cy1 = from.y + dy * 0.1
  const cx2 = from.x + dx * 0.6
  const cy2 = to.y - dy * 0.1
  
  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`
}

const selectNode = (node) => {
  selectedNode.value = node
}

const completeNode = (node) => {
  if (!node.unlocked) return
  
  node.completed = true
  
  // Unlock all children nodes
  connections
    .filter(c => c.from === node.id)
    .forEach(c => {
      const child = getNodeById(c.to)
      if (child) child.unlocked = true
    })
}

const uncompleteNode = (node) => {
  node.completed = false
  
  // Lock all children nodes that depend on this one
  connections
    .filter(c => c.from === node.id)
    .forEach(c => {
      const child = getNodeById(c.to)
      if (child) {
        child.unlocked = false
        child.completed = false
        // Recursively lock descendants
        lockDescendants(child.id)
      }
    })
}

const lockDescendants = (nodeId) => {
  connections
    .filter(c => c.from === nodeId)
    .forEach(c => {
      const child = getNodeById(c.to)
      if (child) {
        child.unlocked = false
        child.completed = false
        lockDescendants(child.id)
      }
    })
}

// === Initialization ===
// Auto-select and unlock start node
nodes.value[0].unlocked = true
selectNode(nodes.value[0])
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.roadmap-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Side-by-side layout on larger screens */
@media (min-width: 768px) {
  .roadmap-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
  .roadmap-scene {
    flex: 1;
    min-width: 0;
  }
  .info-panel {
    width: 350px;
    flex-shrink: 0;
  }
}

/* Roadmap Scene */
.roadmap-scene {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 8 / 5;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.roadmap-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* Connection Paths */
.connection-locked {
  stroke: #334155;
  stroke-dasharray: 8, 6;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.connection-unlocked {
  stroke: #4ade80;
  stroke-dasharray: none;
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.5));
  animation: flow 2s linear infinite;
}

@keyframes flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 20;
  }
}

/* Roadmap Nodes */
.roadmap-node {
  position: absolute;
  width: 64px;
  height: 64px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.roadmap-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.node-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 3px solid #475569;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.node-label {
  font-weight: 600;
  font-size: 11px;
  text-align: center;
  color: #e2e8f0;
  padding: 0.25rem;
  line-height: 1.2;
}

/* Node States */
.roadmap-node.locked .node-inner {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  opacity: 0.6;
}

.roadmap-node.locked .node-label {
  color: #64748b;
}

.roadmap-node.locked {
  cursor: not-allowed;
}

.roadmap-node.completed .node-inner {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.roadmap-node.completed .node-label {
  color: #ffffff;
}

.roadmap-node.current .node-inner {
  border-color: #fbbf24;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* Info Panel */
.info-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: #f1f5f9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #475569;
}

.panel-header h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
}

.node-status {
  display: flex;
  gap: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-completed {
  background: #16a34a;
  color: white;
}

.badge-unlocked {
  background: #0ea5e9;
  color: white;
}

.badge-locked {
  background: #475569;
  color: #94a3b8;
}

.panel-content {
  flex: 1;
}

.description {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.tooltip-section {
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #4ade80;
}

.tooltip-section strong {
  color: #4ade80;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-section p {
  margin: 0;
  color: #e2e8f0;
  font-size: 0.9rem;
}

/* Panel Actions */
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-complete,
.btn-uncomplete {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-complete {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

.btn-complete:active {
  transform: translateY(0);
}

.btn-uncomplete {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

.btn-uncomplete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(100, 116, 139, 0.4);
}

.locked-message {
  text-align: center;
  padding: 0.75rem;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

/* Progress Stats */
.progress-stats {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #475569;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.25rem;
  color: #4ade80;
  font-weight: 700;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .roadmap-wrapper {
    padding: 0.75rem;
  }
  
  .info-panel {
    padding: 1.25rem;
  }
  
  .panel-header h3 {
    font-size: 1.25rem;
  }
}
</style>
