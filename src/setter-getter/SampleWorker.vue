<template>
  <div>
    <h3>Web Worker Demo</h3>
    <button @click="startWorker" :disabled="worker.isRunning">
      {{ worker.isRunning ? 'Worker Running' : 'Start Worker' }}
    </button>
    <button @click="stopWorker" :disabled="!worker.isRunning">Stop Worker</button>

    <div>
      <input v-model.number="number" type="number" />
      <button @click="calculate" :disabled="!worker.isRunning">Calculate Fibonacci</button>
    </div>

    <div v-if="worker.getError()" class="error">
      Error: {{ worker.getError() }}
    </div>

    <div class="results">
      <h4>Results:</h4>
      <div v-for="(result, index) in worker.getResults()" :key="index">
        {{ result.data.input }} → {{ result.data.result }}
        ({{ result.timestamp.toLocaleTimeString() }})
      </div>
    </div>

    <button @click="worker.clearResults()">Clear Results</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWorker } from './useWorker'

const number = ref(10)
const worker = useWorker()

function startWorker() {
  // Create worker from Blob (inline worker)
  const workerCode = `
    self.onmessage = function(e) {
      const n = e.data
      const result = fibonacci(n)
      self.postMessage({ input: n, result: result })
    }

    function fibonacci(n) {
      if (n <= 1) return n
      let a = 0, b = 1
      for (let i = 2; i <= n; i++) {
        const temp = a + b
        a = b
        b = temp
      }
      return b
    }
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  worker.create(blob)
}

function stopWorker() {
  worker.terminate()
}

function calculate() {
  worker.post(number.value)
}
</script>

<style scoped>
.error {
  color: red;
  margin: 10px 0;
  padding: 5px;
  background: #ffe6e6;
  border: 1px solid red;
}

.results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
}
</style>
