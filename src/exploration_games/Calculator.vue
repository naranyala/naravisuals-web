<template>
  <div class="modal" @click="">
  <div class="calculator">
    <!-- Canvas acts as the "LCD screen" -->
    <canvas ref="displayCanvas" width="420" height="120"></canvas>

    <!-- Classic button grid -->
    <div class="buttons">
      <button @click="clear">C</button>
      <button @click="append('(')">(</button>
      <button @click="append(')')">)</button>
      <button @click="backspace" class="op">⌫</button>

      <button @click="append('7')">7</button>
      <button @click="append('8')">8</button>
      <button @click="append('9')">9</button>
      <button @click="append('/') " class="op">÷</button>

      <button @click="append('4')">4</button>
      <button @click="append('5')">5</button>
      <button @click="append('6')">6</button>
      <button @click="append('*') " class="op">×</button>

      <button @click="append('1')">1</button>
      <button @click="append('2')">2</button>
      <button @click="append('3')">3</button>
      <button @click="append('-') " class="op">−</button>

      <button @click="append('0')" class="wide">0</button>
      <button @click="append('.')">.</button>
      <button @click="calculate" class="equal">＝</button>
      <button @click="append('+') " class="op">+</button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import CanvasUtility from "../utilities/canvas.js"

const emit = defineEmits(['toggle-container'])

const displayCanvas = ref(null)
let cu = null

const expression = ref('')
const result = ref('')

onMounted(() => {
  cu = new CanvasUtility(displayCanvas.value)
  renderDisplay()
})

const append = (char) => {
  if (result.value) {
    expression.value = result.value
    result.value = ''
  }
  expression.value += char
  renderDisplay()
}

const clear = () => {
  expression.value = ''
  result.value = ''
  renderDisplay()
}

const backspace = () => {
  expression.value = expression.value.slice(0, -1)
  renderDisplay()
}

const calculate = () => {
  try {
    // Super safe eval alternative using Function constructor
    const calc = new Function('return ' + expression.value.replace(/÷/g, '/').replace(/×/g, '*'))()
    result.value = Number.isInteger(calc) ? calc : parseFloat(calc.toFixed(8)).toString()
  } catch (e) {
    result.value = 'Error'
  }
  renderDisplay()
}

// ------------------------------------------------------------------
// Fancy canvas LCD display using your CanvasUtility
const renderDisplay = async () => {
  await nextTick() // ensure reactivity

  cu.clear()

  // Background (retro calculator green-gray)
  const bg = cu.createLinearGradient(0, 0, 0, 120, [
    { offset: 0, color: '#1a2a1a' },
    { offset: 1, color: '#0d1f0d' }
  ])
  cu.drawRoundedRect(0, 0, 420, 120, 20, bg, '#223322', 4)

  // Inner screen
  cu.drawRoundedRect(15, 15, 390, 90, 12, '#0a1a0a', '#224422', 3)

  // LCD screen background
  const screenGrad = cu.createLinearGradient(20, 20, 20, 100, [
    { offset: 0, color: '#1e3a1e' },
    { offset: 1, color: '#112211' }
  ])
  cu.drawRoundedRect(20, 20, 380, 80, 8, screenGrad)

  // Segment-style text (big retro digits)
  const displayText = result.value || expression.value || '0'
  const fontSize = displayText.length > 12 ? 36 : 48
  const y = result.value ? 50 : 70

  // Glow effect
  cu.setShadow(0, 0, 20, '#22c55e88')
  cu.drawText(
    displayText,
    30,
    y,
    `${fontSize}px 'Courier New', monospace`,
    '#22c55e'
  )
  cu.clearShadow()

  // Small label
  if (result.value) {
    cu.drawText(
      expression.value,
      30,
      40,
      `20px 'Courier New', monospace`,
      '#22c55e88'
    )
  }

  // Tiny blinking cursor if typing
  if (!result.value && expression.value && Date.now() % 1000 < 500) {
    const cursorX = 30 + cu.ctx.measureText(displayText).width + 10
    cu.drawRect(cursorX, y - fontSize + 10, 14, fontSize - 10, '#22c55e')
  }
}
</script>

<style scoped>
.calculator {
  width: 420px;
  margin: 40px auto;
  background: #0f1f0f;
  padding: 20px;
  border-radius: 30px;
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.8),
    inset 0 5px 15px rgba(34,197,94,0.2);
  border: 8px solid #223322;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 20px;
}

button {
  height: 70px;
  font-size: 28px;
  font-weight: bold;
  border-radius: 16px;
  border: none;
  background: #1e3a1e;
  color: #e0f2e0;
  box-shadow: 0 6px #112211;
  cursor: pointer;
  transition: all 0.1s;
}

button:active {
  transform: translateY(4px);
  box-shadow: 0 2px #112211;
}

button.wide {
  grid-column: span 2;
}

button.op {
  background: #334433;
  color: #86efac;
}

button.equal {
  background: #22c55e;
  color: black;
  grid-row: span 2;
  height: 154px;
}

button:hover {
  filter: brightness(1.3);
}


.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
