<template>
  <!-- Demo container with toggle -->
  <div class="demo-container">
    <button class="toggle-button" @click="showModal = true">
      🎨 Open Advanced Color Picker
    </button>

    <!-- Selected color preview -->
    <div v-if="currentColor" class="selected-color-display">
      <div class="preview-swatch-large" :style="{ backgroundColor: currentColor }"></div>
      <div class="color-info">
        <strong>Selected Color:</strong>
        <code>{{ currentColor }}</code>
        <button @click="copyCurrentColor" class="copy-btn" title="Copy color">
          📋
        </button>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="rich-color-backdrop" @click="closeModal" @keydown.esc="closeModal" tabindex="-1">
        <div class="rich-color-modal" @click.stop role="dialog" aria-modal="true" aria-label="Advanced Color Picker">
          <!-- Header -->
          <div class="modal-header">
            <h2>🎨 Choose a Color</h2>
            <button @click="closeModal" aria-label="Close">&times;</button>
          </div>

          <!-- Preview & Input -->
          <div class="color-preview">
            <div class="preview-swatch" :style="{ backgroundColor: workingColor }"></div>
            <input v-model="workingColor" type="text" @blur="applyCustomColor" @keyup.enter="applyCustomColor"
              placeholder="#FF5733" spellcheck="false" />
            <button @click="copyToClipboard" title="Copy to clipboard">
              📋
            </button>
          </div>

          <!-- Preset Palettes -->
          <div class="palette-section">
            <h3>Popular Colors</h3>
            <div class="color-grid">
              <button v-for="color in allColors" :key="color" class="color-swatch" :style="{ backgroundColor: color }"
                :class="{ selected: workingColor === color }" :aria-label="`Select ${color}`"
                @click="selectPreset(color)">
                <span v-if="workingColor === color" class="check">✓</span>
              </button>
            </div>
          </div>

          <!-- Recent Colors -->
          <div v-if="recentColors.length" class="palette-section">
            <h3>Recent</h3>
            <div class="color-grid">
              <button v-for="(color, i) in recentColors" :key="`recent-${i}`" class="color-swatch"
                :style="{ backgroundColor: color }" @click="selectPreset(color)"></button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Self-contained state - no props/emits
const showModal = ref(false)
const currentColor = ref('#3b82f6') // Default color
const workingColor = ref(currentColor.value)
const recentColors = ref([])

// Load recent colors from localStorage
onMounted(() => {
  const saved = localStorage.getItem('colorPickerRecent')
  if (saved) {
    recentColors.value = JSON.parse(saved).slice(0, 8)
  }
})

// Sync working color when current color changes
watch(currentColor, (newColor) => {
  workingColor.value = newColor
})

// Professional-grade color palette
const basePalette = [
  // Tailwind CSS v3 (500 shades + accents)
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#0ea5e9', '#f43f5e', '#14b8a6',

  // Material Design (vibrant but accessible)
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f',
  '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c',
  '#9e9e9e', '#616161', '#424242'
]

// Add grayscale
const grays = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff']

// Combine into final palette
const allColors = [...basePalette, ...grays]

// Derived: enforce valid HEX
const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex)

// Methods
const closeModal = () => {
  showModal.value = false
}

const addRecent = (color) => {
  if (!recentColors.value.includes(color)) {
    recentColors.value = [color, ...recentColors.value].slice(0, 8)
    localStorage.setItem('colorPickerRecent', JSON.stringify(recentColors.value))
  }
}

const selectPreset = (color) => {
  workingColor.value = color
  finalizeColor()
}

const applyCustomColor = () => {
  let hex = workingColor.value.trim()

  // Auto-format: add # if missing
  if (hex[0] !== '#') hex = '#' + hex
  // Support 3-digit shorthand
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }

  if (isValidHex(hex)) {
    workingColor.value = hex.toUpperCase()
    finalizeColor()
  } else {
    // Revert to last valid
    workingColor.value = currentColor.value
    alert('Please enter a valid hex color (e.g., #FF5733)')
  }
}

const finalizeColor = () => {
  currentColor.value = workingColor.value
  addRecent(workingColor.value)
  console.log('Color selected:', workingColor.value) // Replace with your logic
  closeModal()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(workingColor.value)
    console.log('Color copied to clipboard:', workingColor.value)
  } catch (err) {
    console.error('Failed to copy color:', err)
  }
}

const copyCurrentColor = async () => {
  try {
    await navigator.clipboard.writeText(currentColor.value)
    console.log('Current color copied:', currentColor.value)
  } catch (err) {
    console.error('Failed to copy color:', err)
  }
}
</script>

<style scoped>
/* Demo container styles */
.demo-container {
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 400px;
}

.toggle-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.toggle-button:hover {
  background: #2563eb;
}

.selected-color-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.preview-swatch-large {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  flex-shrink: 0;
}

.color-info {
  flex: 1;
}

.color-info strong {
  display: block;
  margin-bottom: 4px;
  color: #334155;
}

.color-info code {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  color: #0f172a;
}

.copy-btn {
  background: #e2e8f0;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #cbd5e1;
}

/* Modal styles (unchanged) */
.rich-color-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  animation: fadeIn 0.15s ease-out;
}

.rich-color-modal {
  background: white;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 95vw;
  width: 360px;
  overflow: hidden;
  animation: zoomIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: grid;
  place-content: center;
  border-radius: 6px;
}

.modal-header button:hover {
  background: #f3f4f6;
}

/* Preview bar */
.color-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #eee;
}

.preview-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.color-preview input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.95rem;
}

.color-preview button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-content: center;
  font-size: 0.9rem;
}

.color-preview button:hover {
  background: #e5e7eb;
}

/* Palettes */
.palette-section {
  padding: 16px 20px 0;
}

.palette-section h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
  gap: 8px;
}

.color-swatch {
  aspect-ratio: 1;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s ease;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.selected {
  border-color: white;
  box-shadow: 0 0 0 2px #374151;
}

.check {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: white;
  color: #1f2937;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Animations */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
