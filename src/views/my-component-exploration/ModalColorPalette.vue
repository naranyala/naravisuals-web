<template>
  <!-- Toggle button for demo -->
  <div class="demo-container">
    <button class="toggle-button" @click="showModal = true">
      🎨 Open Color Picker
    </button>

    <!-- Show selected color preview -->
    <div v-if="currentColor" class="color-preview">
      <div class="preview-swatch" :style="{ backgroundColor: currentColor }"></div>
      <span>Selected: {{ currentColor }}</span>
    </div>

    <!-- Backdrop (covers entire viewport) -->
    <Teleport to="body">
      <div v-if="showModal" class="color-picker-backdrop" @click="closeModal">
        <!-- Modal container -->
        <div class="color-picker-modal" @click.stop role="dialog" aria-modal="true" aria-label="Color Picker">
          <div class="modal-header">
            <h2>Choose a Color</h2>
            <button class="close-button" @click="closeModal" aria-label="Close color picker">
              ✕
            </button>
          </div>

          <!-- Color grid -->
          <div class="color-grid">
            <button v-for="color in colors" :key="color" class="color-swatch" :style="{ backgroundColor: color }"
              :aria-label="`Select ${color} color`" @click="selectColor(color)">
              <!-- Visual indicator for selected color -->
              <div v-if="currentColor === color" class="selected-indicator">
                ✓
              </div>
            </button>
          </div>

          <!-- Custom color input -->
          <div class="custom-color">
            <label for="custom-color">Custom Hex:</label>
            <input id="custom-color" type="text" v-model="customColorInput" @blur="setCustomColor" placeholder="#FF5733"
              maxlength="7" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Reactive data - no props/emits needed
const showModal = ref(false)
const currentColor = ref('#3498db') // Default color
const customColorInput = ref(currentColor.value)

// Color palette
const colors = ref([
  // Material Design color palette
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047',
  '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00',
  '#F4511E', '#6D4C41', '#757575', '#546E7A'
])

// Watch for color changes to update the input
watch(currentColor, (newColor) => {
  customColorInput.value = newColor
})

// Methods
const closeModal = () => {
  showModal.value = false
}

const selectColor = (color) => {
  currentColor.value = color
  console.log('Color selected:', color) // You can replace this with your logic
  closeModal()
}

const setCustomColor = () => {
  // Validate hex color format
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i
  if (hexRegex.test(customColorInput.value)) {
    currentColor.value = customColorInput.value
    console.log('Custom color selected:', customColorInput.value) // You can replace this with your logic
    closeModal()
  } else {
    // Revert to last valid color
    customColorInput.value = currentColor.value
    alert('Please enter a valid hex color (e.g., #FF5733)')
  }
}
</script>

<style scoped>
/* Demo container styles */
.demo-container {
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.toggle-button {
  background: #1e88e5;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-button:hover {
  background: #1976d2;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.preview-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

/* Backdrop styles */
.color-picker-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

/* Modal styles */
.color-picker-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-width: 320px;
  max-width: 90vw;
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
}

/* Color grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  padding: 20px;
}

.color-swatch {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.1);
  border-color: #ddd;
}

/* Selected indicator */
.selected-indicator {
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Custom color input */
.custom-color {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.custom-color label {
  font-weight: 500;
  color: #555;
  white-space: nowrap;
}

.custom-color input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: monospace;
}

.custom-color input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
