<!-- DynamicTextStyle.vue -->
<template>
  <div class="wrapper">
    <!-- Live Preview - top on mobile -->
    <article class="preview" :style="computedStyle">
      <p>The quick brown fox jumps over the lazy dog.</p>
      <p>Pack my box with five dozen liquor jugs.</p>
      <p>How vexingly quick daft zebras jump!</p>
    </article>

    <section class="panel">
      <h2>Dynamic Text Styling</h2>

      <!-- Controls Grid -->
      <div class="controls">
        <!-- Font Size -->
        <label class="control-group full-width">
          <span class="label-text">Size: {{ fontSize }}px</span>
          <input
            v-model.number="fontSize"
            type="range"
            min="12"
            max="80"
            step="1"
            class="range-input"
          />
        </label>

        <!-- Font Weight -->
        <label class="control-group">
          <span class="label-text">Weight</span>
          <select v-model="fontWeight">
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra-bold (800)</option>
          </select>
        </label>

        <!-- Text Align -->
        <label class="control-group">
          <span class="label-text">Align</span>
          <select v-model="textAlign">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </label>

        <!-- Text Color -->
        <label class="control-group">
          <span class="label-text">Color</span>
          <input v-model="textColor" type="color" class="color-input" />
        </label>

        <!-- Background Color -->
        <label class="control-group">
          <span class="label-text">Background</span>
          <input v-model="bgColor" type="color" class="color-input" />
        </label>

        <!-- Letter Spacing -->
        <label class="control-group full-width">
          <span class="label-text">Letter-spacing: {{ letterSpacing }}em</span>
          <input
            v-model.number="letterSpacing"
            type="range"
            min="-0.1"
            max="0.4"
            step="0.01"
            class="range-input"
          />
        </label>

        <!-- Line Height -->
        <label class="control-group full-width">
          <span class="label-text">Line-height: {{ lineHeight }}</span>
          <input
            v-model.number="lineHeight"
            type="range"
            min="1"
            max="3"
            step="0.1"
            class="range-input"
          />
        </label>

        <!-- Text Transform -->
        <label class="control-group">
          <span class="label-text">Transform</span>
          <select v-model="textTransform">
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </label>

        <!-- Text Decoration -->
        <label class="control-group">
          <span class="label-text">Decoration</span>
          <select v-model="textDecoration">
            <option value="none">None</option>
            <option value="underline">Underline</option>
            <option value="overline">Overline</option>
            <option value="line-through">Line-through</option>
          </select>
        </label>
      </div>

      <!-- CSS Output -->
      <details class="css-section">
        <summary>CSS Output</summary>
        <pre class="css">{{ cssOutput }}</pre>
      </details>

      <!-- Reset Button -->
      <button @click="resetStyles" class="btn-reset">Reset to Defaults</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

/* Reactive state for every control */
const fontSize = ref(24);
const fontWeight = ref("400");
const textColor = ref("#f1f5f9");
const bgColor = ref("#1e293b");
const letterSpacing = ref(0);
const lineHeight = ref(1.6);
const textAlign = ref("left");
const textTransform = ref("none");
const textDecoration = ref("none");

/* Combine everything into one style object */
const computedStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  fontWeight: fontWeight.value,
  color: textColor.value,
  backgroundColor: bgColor.value,
  letterSpacing: `${letterSpacing.value}em`,
  lineHeight: lineHeight.value,
  textAlign: textAlign.value,
  textTransform: textTransform.value,
  textDecoration: textDecoration.value,
}));

/* CSS output for copying */
const cssOutput = computed(() => {
  return `.text {
  font-size: ${fontSize.value}px;
  font-weight: ${fontWeight.value};
  color: ${textColor.value};
  background-color: ${bgColor.value};
  letter-spacing: ${letterSpacing.value}em;
  line-height: ${lineHeight.value};
  text-align: ${textAlign.value};
  text-transform: ${textTransform.value};
  text-decoration: ${textDecoration.value};
}`;
});

/* Reset to defaults */
function resetStyles() {
  fontSize.value = 24;
  fontWeight.value = "400";
  textColor.value = "#f1f5f9";
  bgColor.value = "#1e293b";
  letterSpacing.value = 0;
  lineHeight.value = 1.6;
  textAlign.value = "left";
  textTransform.value = "none";
  textDecoration.value = "none";
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* max-width: 100%; */
  width: 100%;
  padding: 1rem;
  background: #0f172a;
  min-height: 100vh;
}

.preview {
  width: 100%;
  padding: 2rem;
  border: 1px solid #334155;
  border-radius: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  order: -1; /* Ensures preview is first on mobile */
  transition: all 0.15s ease;
}

.preview p {
  margin: 0 0 0.5em 0;
}

.preview p:last-child {
  margin-bottom: 0;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.panel h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

/* Controls Grid */
.controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group.full-width {
  grid-column: 1 / -1;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

select {
  padding: 0.5rem;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #0f172a;
  color: #e2e8f0;
  cursor: pointer;
}

select:hover {
  border-color: #64748b;
}

.range-input {
  width: 100%;
  cursor: pointer;
  accent-color: #3b82f6;
}

.color-input {
  width: 100%;
  height: 48px;
  border: 2px solid #475569;
  border-radius: 6px;
  cursor: pointer;
  background: #0f172a;
}

.color-input:hover {
  border-color: #64748b;
}

/* CSS Output Section */
.css-section {
  margin-top: 0.5rem;
}

.css-section summary {
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #cbd5e1;
  user-select: none;
}

.css-section summary:hover {
  background: #1e293b;
  border-color: #475569;
}

.css {
  background: #020617;
  color: #a5f3fc;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  margin-top: 0.5rem;
  overflow-x: auto;
  white-space: pre;
  border: 1px solid #1e293b;
}

/* Reset Button */
.btn-reset {
  padding: 0.75rem 1rem;
  background: #475569;
  color: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-reset:hover {
  background: #64748b;
}

/* Tablet and up */
@media (min-width: 640px) {
  .controls {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .wrapper {
    flex-direction: row;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .preview {
    width: 50%;
    order: 0;
    min-height: 400px;
  }
  
  .panel {
    width: 50%;
  }
}
</style>
