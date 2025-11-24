<!-- DynamicTextStyle.vue -->
<template>
  <div class="container">
  <section class="panel">
    <h2>Dynamic Text Styling</h2>

    <!-- Controls -->
    <div class="controls">
      <!-- Font Size -->
      <label class="control-group">
        <span>Size: {{ fontSize }}px</span>
        <input
          v-model.number="fontSize"
          type="range"
          min="12"
          max="80"
          step="1"
        />
      </label>

      <!-- Font Weight -->
      <label class="control-group">
        <span>Weight:</span>
        <select v-model="fontWeight">
          <option value="300">Light (300)</option>
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-bold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </label>

      <!-- Text Color -->
      <label class="control-group">
        <span>Color:</span>
        <input v-model="textColor" type="color" />
      </label>

      <!-- Letter Spacing -->
      <label class="control-group">
        <span>Letter-spacing: {{ letterSpacing }}em</span>
        <input
          v-model.number="letterSpacing"
          type="range"
          min="-0.1"
          max="0.4"
          step="0.01"
        />
      </label>

      <!-- Line Height -->
      <label class="control-group">
        <span>Line-height: {{ lineHeight }}</span>
        <input
          v-model.number="lineHeight"
          type="range"
          min="1"
          max="3"
          step="0.1"
        />
      </label>
    </div>
  </section>

  <!-- Live Preview -->
  <article class="preview" :style="computedStyle">
    The quick brown fox jumps over the lazy dog.<br />
    Pack my box with five dozen liquor jugs.
  </article>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

/* Reactive state for every control */
const fontSize = ref(24);
const fontWeight = ref(400);
const textColor = ref("#222222");
const letterSpacing = ref(0);
const lineHeight = ref(1.4);

/* Combine everything into one style object */
const computedStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  fontWeight: fontWeight.value,
  color: textColor.value,
  letterSpacing: `${letterSpacing.value}em`,
  lineHeight: lineHeight.value,
}));
</script>

<style scoped>
.container {
  display: flex;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 320px;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.preview {
  max-width: 600px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: system-ui, sans-serif;
}
</style>

