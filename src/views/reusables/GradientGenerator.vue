<template>
  <div class="gradient-generator">
    <div class="preview-container">
      <div 
        class="gradient-preview"
        :style="{ background: currentGradient }"
      />
    </div>

    <div class="controls">
      <div class="color-stops">
        <div 
          v-for="(stop, index) in colorStops" 
          :key="index"
          class="color-stop"
        >
          <input
            type="color"
            :value="stop.color"
            @input="updateColor(index, $event.target.value)"
          />
          <input
            type="range"
            min="0"
            max="100"
            :value="stop.position"
            @input="updatePosition(index, $event.target.value)"
          />
          <span>{{ stop.position }}%</span>
          <button 
            v-if="colorStops.length > 2"
            @click="removeColorStop(index)"
            class="remove-btn"
          >
            ×
          </button>
        </div>
      </div>

      <button @click="addColorStop" class="add-btn">
        + Add Color Stop
      </button>
      
      <div class="direction-controls">
        <label>Direction:</label>
        <select v-model="direction" class="direction-select">
          <option value="to top">Top</option>
          <option value="to bottom">Bottom</option>
          <option value="to left">Left</option>
          <option value="to right">Right</option>
          <option value="to top left">Top-Left</option>
          <option value="to top right">Top-Right</option>
          <option value="to bottom left">Bottom-Left</option>
          <option value="to bottom right">Bottom-Right</option>
        </select>
      </div>
    </div>

    <div class="code-output">
      <div class="output-header">
        <h3>CSS Code</h3>
        <button 
          @click="copyToClipboard"
          :class="{ copied: copied }"
        >
          {{ copied ? '✓ Copied!' : 'Copy Code' }}
        </button>
      </div>
      <pre ref="codeElement">{{ currentGradient }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

// Reactive state
const direction = ref('to bottom');
const copied = ref(false);
const codeElement = ref(null);

const colorStops = ref([
  { color: '#007bff', position: 0 },
  { color: '#00aaff', position: 100 }
]);

// Computed gradient string
const currentGradient = computed(() => {
  const stops = colorStops.value
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  
  return `linear-gradient(${direction.value}, ${stops})`;
});

// Methods
const updateColor = (index, color) => {
  colorStops.value[index].color = color;
};

const updatePosition = (index, position) => {
  colorStops.value[index].position = Number(position);
  // Sort stops by position
  colorStops.value.sort((a, b) => a.position - b.position);
};

const addColorStop = () => {
  const newPosition = 50;
  const newColor = '#ff6b6b';
  
  colorStops.value.push({ color: newColor, position: newPosition });
  
  // Sort after adding
  colorStops.value.sort((a, b) => a.position - b.position);
};

const removeColorStop = (index) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1);
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentGradient.value);
    copied.value = true;
    
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};
</script>

<style scoped>
.gradient-generator {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: Arial, sans-serif;
}

.preview-container {
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.gradient-preview {
  width: 100%;
  height: 100%;
}

.controls {
  margin-bottom: 1.5rem;
}

.color-stop {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.color-stop input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-stop input[type="range"] {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
}

.color-stop span {
  min-width: 40px;
  font-size: 0.9rem;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
}

.add-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.direction-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.direction-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex: 1;
}

.code-output {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f5f5f5;
}

.output-header h3 {
  margin: 0;
  font-size: 1rem;
}

.output-header button {
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.output-header button.copied {
  background: #20c16c;
}

pre {
  padding: 1rem;
  margin: 0;
  background: #2d2d2d;
  color: #f8f8f2;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
