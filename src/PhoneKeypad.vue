
<script setup>
import { ref, watch, onMounted } from "vue";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const display = ref("");

onMounted(() => {
  display.value = ""
})

function randomFourDigitNumber() {
  const randVal = Math.floor(1000 + Math.random() * 9000);
  display.value = randVal
}

// Add digits
function press(n) {
  if (typeof n === "number") {
    display.value += n.toString();

    if(display.value.toString() === '6969') alert("6969!")
    if(display.value.toString() === '1234') alert("1234!")
    if(display.value.toString() === '8888') alert("8888!")

  } else {
    display.value += n;
  }
}

// Remove last digit
function backspace() {
  const strVal = String(display.value);
  console.log(strVal)
  display.value = strVal.slice(0, -1);
}

// Optional v-model support
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue"]);

watch(display, v => emit("update:modelValue", v));
</script>


<template>
  <div class="keypad-wrapper">
    <div class="keypad-container">
      <!-- Display -->
      <input
        v-model="display"
        class="keypad-display"
        placeholder="type secret code"
        readonly
      />
      <!-- Keypad -->
      <div class="keypad-grid">
        <button
          v-for="n in numbers"
          :key="n"
          class="keypad-btn"
          @click="press(n)"
        >
          {{ n }}
        </button>
        <!-- extra row -->
        <button class="keypad-btn" @click="randomFourDigitNumber">rand</button>
        <button class="keypad-btn" @click="press(0)">0</button>
        <button class="keypad-btn keypad-btn-special" @click="backspace">⌫</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------
   Enhanced Dark Theme Variables
--------------------------------*/
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #121212;
  --surface: #1a1a1a;
  --surface-hover: #252525;
  --surface-active: #2f2f2f;
  --border: #2a2a2a;
  --border-focus: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --special: #ef4444;
  --special-hover: #dc2626;
  --radius: 16px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Wrapper for centering */
.keypad-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

/* Container */
.keypad-container {
  width: 100%;
  max-width: 280px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: grid;
  gap: 20px;
}

/* Large screen adjustments */
@media (min-width: 768px) {
  .keypad-container {
    max-width: 360px;
    padding: 32px;
    gap: 24px;
  }
}

/* Display */
.keypad-display {
  width: 100%;
  padding: 16px 14px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  background: var(--surface);
  color: var(--text-primary);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  outline: none;
  user-select: none;
  transition: var(--transition);
  letter-spacing: 0.5px;
}

.keypad-display:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.keypad-display::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

/* Grid layout */
.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .keypad-grid {
    gap: 16px;
  }
}

/* Buttons */
.keypad-btn {
  background: var(--surface);
  color: var(--text-primary);
  padding: 20px 0;
  /* border-radius: calc(var(--radius) - 4px); */
  /* border: 1px solid var(--border); */
  border: 1px solid lightgray;
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  user-select: none;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .keypad-btn {
    padding: 24px 0;
    font-size: 1.5rem;
  }
}

/* Ripple effect on click */
.keypad-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.keypad-btn:active::before {
  width: 200px;
  height: 200px;
}

.keypad-btn:hover {
  background: var(--surface-hover);
  border-color: var(--border-focus);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.keypad-btn:active {
  background: var(--surface-active);
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Special button (backspace) */
.keypad-btn-special {
  background: linear-gradient(135deg, var(--special) 0%, #c81e1e 100%);
  border-color: var(--special);
  font-size: 1.3rem;
}

.keypad-btn-special:hover {
  background: linear-gradient(135deg, var(--special-hover) 0%, var(--special) 100%);
  border-color: var(--special-hover);
}

/* Focus styles for accessibility */
.keypad-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
