<template>
  <div class="diagram" ref="diagramRef">
    <svg class="connection-svg">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#4a90e2"
          />
        </marker>
      </defs>
      <line
        :x1="connectionStart.x"
        :y1="connectionStart.y"
        :x2="connectionEnd.x"
        :y2="connectionEnd.y"
        stroke="#4a90e2"
        stroke-width="2"
        marker-end="url(#arrowhead)"
      />
    </svg>

    <div
      class="box"
      ref="box1Ref"
      @mousedown="startDrag($event, 'box1')"
    >
      Dialog A
    </div>

    <div
      class="box"
      ref="box2Ref"
      @mousedown="startDrag($event, 'box2')"
    >
      Dialog B
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'

const box1Ref = ref(null)
const box2Ref = ref(null)
const diagramRef = ref(null)

const box1Position = ref({ x: 0, y: 0 })
const box2Position = ref({ x: 0, y: 0 })

let isDragging = false
let currentBox = null
let offsetX = 0
let offsetY = 0

// Calculate connection points based on box positions
const connectionStart = computed(() => {
  if (!box1Ref.value) return { x: 0, y: 0 }
  
  const rect = box1Ref.value.getBoundingClientRect()
  const diagramRect = diagramRef.value.getBoundingClientRect()
  
  return {
    x: rect.right - diagramRect.left,
    y: rect.top + rect.height / 2 - diagramRect.top
  }
})

const connectionEnd = computed(() => {
  if (!box2Ref.value) return { x: 0, y: 0 }
  
  const rect = box2Ref.value.getBoundingClientRect()
  const diagramRect = diagramRef.value.getBoundingClientRect()
  
  return {
    x: rect.left - diagramRect.left,
    y: rect.top + rect.height / 2 - diagramRect.top
  }
})

const startDrag = (e, boxId) => {
  const box = boxId === 'box1' ? box1Ref.value : box2Ref.value
  if (!box) return

  isDragging = true
  currentBox = box

  // Calculate offset so dragging is smooth from click point
  const rect = box.getBoundingClientRect()
  const diagramRect = diagramRef.value.getBoundingClientRect()
  
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top

  // Store initial position
  if (boxId === 'box1') {
    box1Position.value = {
      x: rect.left - diagramRect.left,
      y: rect.top - diagramRect.top
    }
  } else {
    box2Position.value = {
      x: rect.left - diagramRect.left,
      y: rect.top - diagramRect.top
    }
  }

  // Prevent text selection during drag
  e.preventDefault()
}

const doDrag = (e) => {
  if (!isDragging || !currentBox) return

  // Update position using transform (keeps layout intact)
  const x = e.clientX - offsetX
  const y = e.clientY - offsetY

  // Convert to position relative to diagram container
  const containerRect = diagramRef.value.getBoundingClientRect()
  const relX = x - containerRect.left
  const relY = y - containerRect.top

  currentBox.style.transform = `translate(${relX}px, ${relY}px)`
  
  // Update the position state for the connection line
  if (currentBox === box1Ref.value) {
    box1Position.value = { x: relX, y: relY }
  } else if (currentBox === box2Ref.value) {
    box2Position.value = { x: relX, y: relY }
  }
}

const stopDrag = () => {
  isDragging = false
  currentBox = null
}

onMounted(() => {
  window.addEventListener('mousemove', doDrag)
  window.addEventListener('mouseup', stopDrag)
  
  // Initialize positions
  if (box1Ref.value && box2Ref.value) {
    const diagramRect = diagramRef.value.getBoundingClientRect()
    
    const box1Rect = box1Ref.value.getBoundingClientRect()
    box1Position.value = {
      x: box1Rect.left - diagramRect.left,
      y: box1Rect.top - diagramRect.top
    }
    
    const box2Rect = box2Ref.value.getBoundingClientRect()
    box2Position.value = {
      x: box2Rect.left - diagramRect.left,
      y: box2Rect.top - diagramRect.top
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', doDrag)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.diagram {
  position: relative;
  min-height: 200px;
  padding: 60px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: visible;
}

.connection-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.box {
  width: 120px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f8ff;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  font-family: sans-serif;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  cursor: grab;
  user-select: none;
  position: absolute;
  transition: transform 0.1s ease;
  z-index: 2;
}

.box:active {
  cursor: grabbing;
}

/* Position boxes initially */
.box:nth-child(2) {
  left: 60px;
  top: 60px;
}

.box:nth-child(3) {
  left: 260px;
  top: 60px;
}
</style>
