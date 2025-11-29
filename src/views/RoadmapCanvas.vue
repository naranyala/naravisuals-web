<template>
  <div class="roadmap-container">
    <div class="controls">
      <h1>Interactive Learning Roadmap</h1>
      <div class="buttons">
        <button @click="resetView">Reset View</button>
        <button @click="autoLayout">Auto Layout</button>
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="roadmapCanvas" @wheel.prevent="handleZoom" @contextmenu.prevent></canvas>
      <div class="hint">
        💡 Drag nodes • Scroll to zoom • Hold space or middle-click to pan
      </div>
    </div>

    <div v-if="selectedStage" class="stage-details">
      <h2>{{ selectedStage.title }}</h2>
      <p>{{ selectedStage.description }}</p>
      <div class="actions">
        <button @click="toggleCompletion(selectedStage)" :class="{ completed: selectedStage.completed }">
          {{ selectedStage.completed ? '✓ Completed' : 'Mark Complete' }}
        </button>
        <button @click="selectedStage = null" class="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RoadmapCanvas } from './roadmapCanvas.js'

const stages = ref([
  { id: 1, title: 'HTML/CSS/JS', x: 150, y: 200, description: 'Web fundamentals', completed: true, dependencies: [] },
  { id: 2, title: 'Vue Basics', x: 350, y: 100, description: 'Reactivity, directives, lifecycle', completed: true, dependencies: [1] },
  { id: 3, title: 'Components', x: 550, y: 150, description: 'Props, events, slots', completed: true, dependencies: [2] },
  { id: 4, title: 'Vue Router', x: 750, y: 100, description: 'Navigation & routes', completed: false, dependencies: [3] },
  { id: 5, title: 'Pinia', x: 750, y: 300, description: 'State management', completed: false, dependencies: [3] },
  { id: 6, title: 'Vue 3 Adv.', x: 950, y: 200, description: 'Composition API, Teleport, Suspense', completed: false, dependencies: [3, 4, 5] },
])

const roadmapCanvas = ref(null)
const selectedStage = ref(null)
let roadmap = null

onMounted(() => {
  if (roadmapCanvas.value) {
    // Make canvas fill container
    const resizeCanvas = () => {
      roadmapCanvas.value.width = roadmapCanvas.value.offsetWidth
      roadmapCanvas.value.height = roadmapCanvas.value.offsetHeight
      roadmap?.draw()
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    roadmap = new RoadmapCanvas(roadmapCanvas.value, stages.value)
    roadmap.resetView()

    // Click handler moved into class, but we still want selection
    roadmapCanvas.value.addEventListener('click', (e) => {
      if (e.detail === 1 && !roadmap.draggedStage && !roadmap.isPanning) { // not part of drag/pan
        const point = roadmap.getTransformedPoint(e.clientX, e.clientY)
        const stage = roadmap.findStageAtPoint(point.x, point.y)
        selectedStage.value = stage || null
        roadmap.selectedStage = stage
        roadmap.draw()
      }
    })
  }
})

onBeforeUnmount(() => {
  roadmap?.destroy()
})

// Reactivity: redraw when stages change
watch(stages, () => roadmap?.draw(), { deep: true })

const handleZoom = (e) => roadmap?.zoom(e)
const resetView = () => roadmap?.resetView()

const toggleCompletion = (stage) => {
  stage.completed = !stage.completed
}

const autoLayout = () => {
  // Simple vertical layout
  stages.value.forEach((s, i) => {
    s.x = 200 + (i % 3) * 250
    s.y = 150 + Math.floor(i / 3) * 200
  })
  roadmap.draw()
}
</script>

<style scoped>
.roadmap-container {
  background: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  padding: 1rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.buttons button {
  margin-left: 0.5rem;
}

.canvas-wrapper {
  position: relative;
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  height: 70vh;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: #0f172a;
}

.hint {
  position: absolute;
  bottom: 12px;
  left: 16px;
  font-size: 0.85rem;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 6px;
}

.stage-details {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid #4299e1;
}

.actions button {
  margin-right: 0.5rem;
}

.actions .completed {
  background: #48bb78;
}

.close {
  background: #e2e8f0;
  color: #1e293b;
}
</style>
