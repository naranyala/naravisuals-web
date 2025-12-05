<template>
  <div>
    <h3>Idle Detection</h3>

    <div class="status" :class="{ idle: idleDetector.get() }">
      Status: {{ idleDetector.get() ? 'IDLE' : 'ACTIVE' }}
    </div>

    <div class="stats">
      <p>Last active: {{ new Date(idleDetector.getLastActive()).toLocaleTimeString() }}</p>
      <p>Idle time: {{ idleDetector.getSecondsIdle() }} seconds</p>
    </div>

    <div class="controls">
      <button @click="idleDetector.reset()">Reset Timer</button>
      <button @click="toggleIdleMode">
        {{ idleDetector.get() ? 'Wake Up' : 'Force Idle' }}
      </button>

      <select v-model="selectedTimeout" @change="updateTimeout">
        <option value="10000">10 seconds</option>
        <option value="30000">30 seconds</option>
        <option value="60000">1 minute</option>
        <option value="300000">5 minutes</option>
      </select>
    </div>

    <p class="hint">Move mouse or press any key to reset idle timer</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useIdle } from './useIdle'

const selectedTimeout = ref('300000')
const idleDetector = useIdle(parseInt(selectedTimeout.value))

function toggleIdleMode() {
  if (idleDetector.get()) {
    idleDetector.reset()
  } else {
    // Simulate idle by setting last active time far in the past
    idleDetector.lastActive.value = Date.now() - 1000000
    idleDetector.isIdle.value = true
    idleDetector.updateIdleTime()
  }
}

function updateTimeout() {
  idleDetector.setConfig(parseInt(selectedTimeout.value))
}
</script>

<style scoped>
.status {
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  border-radius: 8px;
  background: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
  transition: all 0.3s ease;
}

.status.idle {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }

  100% {
    opacity: 1;
  }
}

.stats {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.hint {
  color: #6c757d;
  font-style: italic;
  margin-top: 20px;
}
</style>
