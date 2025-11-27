
<script setup>
import { ref, onMounted } from 'vue'
import canvasplotlib from '../../utilities/canvasplotlib.js'

const selectedEquation = ref('fourier')
const equations = ref([
  {
    id: 'fourier',
    name: 'Fourier Series',
    expression: 'Σ(sin((2n-1)x)/(2n-1))',
    color: '#1f77b4'
  },
  {
    id: 'bessel',
    name: 'Bessel Function',
    expression: 'J₀(x)',
    color: '#ff7f0e'
  },
  {
    id: 'gamma',
    name: 'Gamma Function',
    expression: 'Γ(x)',
    color: '#2ca02c'
  },
  {
    id: 'airy',
    name: 'Airy Function',
    expression: 'Ai(x)',
    color: '#d62728'
  },
  {
    id: 'legendre',
    name: 'Legendre Polynomial',
    expression: 'P₄(x)',
    color: '#9467bd'
  },
  {
    id: 'quantum',
    name: 'Quantum Wave',
    expression: 'ψ(x) = e^(-x²/2)H₃(x)',
    color: '#8c564b'
  }
])

const plotCanvas = ref(null)

// Complex mathematical functions
const calculateFunction = (xVal, equationId) => {
  switch (equationId) {
    case 'fourier':
      // Fourier series approximation of square wave
      let sum = 0
      const terms = 20
      for (let n = 1; n <= terms; n++) {
        sum += Math.sin((2 * n - 1) * xVal) / (2 * n - 1)
      }
      return sum * (4 / Math.PI)
    
    case 'bessel':
      // Bessel function of first kind, order 0 (approximation)
      let j0 = 0
      for (let k = 0; k <= 20; k++) {
        const term = Math.pow(-1, k) * Math.pow(xVal / 2, 2 * k) / Math.pow(factorial(k), 2)
        j0 += term
      }
      return j0
    
    case 'gamma':
      // Gamma function approximation (Lanczos)
      if (xVal <= 0 && Math.floor(xVal) === xVal) return NaN
      const g = 7
      const p = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
      ]
      if (xVal < 0.5) {
        return Math.PI / (Math.sin(Math.PI * xVal) * calculateFunction(1 - xVal, 'gamma'))
      }
      xVal -= 1
      let a = p[0]
      for (let i = 1; i < p.length; i++) {
        a += p[i] / (xVal + i)
      }
      const t = xVal + g + 0.5
      return Math.sqrt(2 * Math.PI) * Math.pow(t, xVal + 0.5) * Math.exp(-t) * a
    
    case 'airy':
      // Airy function Ai(x) approximation
      if (xVal >= 0) {
        return Math.exp(-2 * Math.pow(xVal, 1.5) / 3) / (2 * Math.sqrt(Math.PI) * Math.pow(xVal, 0.25))
      } else {
        const z = 2 * Math.pow(-xVal, 1.5) / 3
        return (Math.sin(z + Math.PI / 4) / Math.sqrt(Math.PI * Math.pow(-xVal, 0.25)))
      }
    
    case 'legendre':
      // Legendre polynomial P4(x)
      return (35 * Math.pow(xVal, 4) - 30 * Math.pow(xVal, 2) + 3) / 8
    
    case 'quantum':
      // Quantum harmonic oscillator wavefunction n=3
      const H3 = 8 * Math.pow(xVal, 3) - 12 * xVal // Hermite polynomial H3
      return Math.exp(-xVal * xVal / 2) * H3
    
    default:
      return xVal
  }
}

const factorial = (n) => {
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

const plotFunction = () => {
  if (!plotCanvas.value) return

  const currentEq = equations.value.find(eq => eq.id === selectedEquation.value)
  if (!currentEq) return

  const x = []
  const y = []
  const points = 1000

  // Dynamic range based on equation type
  let xMin, xMax
  switch (selectedEquation.value) {
    case 'fourier':
      xMin = -3 * Math.PI
      xMax = 3 * Math.PI
      break
    case 'bessel':
      xMin = -20
      xMax = 20
      break
    case 'gamma':
      xMin = -4.9
      xMax = 5
      break
    case 'airy':
      xMin = -15
      xMax = 5
      break
    case 'legendre':
      xMin = -1.5
      xMax = 1.5
      break
    case 'quantum':
      xMin = -4
      xMax = 4
      break
    default:
      xMin = -10
      xMax = 10
  }

  for (let i = 0; i < points; i++) {
    const xVal = xMin + (xMax - xMin) * (i / points)
    const yVal = calculateFunction(xVal, selectedEquation.value)

    x.push(xVal)
    y.push(isFinite(yVal) ? yVal : NaN)
  }

  const fig = canvasplotlib.figure(plotCanvas.value)
  fig.plot(x, y)
     .color(currentEq.color)
     .title(`${currentEq.name}: ${currentEq.expression}`)
     .xlabel('x')
     .ylabel('f(x)')
     .show()
}

onMounted(() => {
  plotFunction()
})
</script>

<template>
  <div class="minimal-container">
    <div class="header">
      <h1>Advanced Mathematical Functions</h1>
      <p>Visualizing complex mathematical functions with full X/Y axes</p>
    </div>

    <div class="controls">
      <select v-model="selectedEquation" @change="plotFunction" class="equation-select">
        <option v-for="eq in equations" :key="eq.id" :value="eq.id">
          {{ eq.name }}: {{ eq.expression }}
        </option>
      </select>
    </div>

    <div class="plot-area">
      <canvas ref="plotCanvas" width="800" height="500"></canvas>
    </div>

    <div class="equation-info">
      <div class="current-equation">
        <strong>Currently viewing:</strong> 
        {{ equations.find(eq => eq.id === selectedEquation)?.name }}
      </div>
      <div class="equation-expression">
        f(x) = {{ equations.find(eq => eq.id === selectedEquation)?.expression }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.minimal-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.8em;
  font-weight: 300;
}

.header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95em;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.equation-select {
  padding: 10px 16px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  background: black;
  font-size: 14px;
  min-width: 300px;
  transition: border-color 0.2s ease;
}

.equation-select:focus {
  outline: none;
  border-color: #3498db;
}

.plot-area {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

canvas {
  display: block;
  margin: 0 auto;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
}

.equation-info {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.current-equation {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.equation-expression {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

@media (max-width: 768px) {
  .minimal-container {
    padding: 15px;
  }
  
  .equation-select {
    min-width: 100%;
  }
  
  canvas {
    width: 100%;
    height: auto;
  }
}
</style>
