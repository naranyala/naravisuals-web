<template>
  <div>
    <h3>Event Emitter</h3>

    <div class="controls">
      <input v-model="eventName" placeholder="Event name" />
      <input v-model="eventData" placeholder="Event data (JSON)" />
      <button @click="triggerEvent">Emit Event</button>
      <button @click="listenToEvent">Listen to Event</button>
      <button @click="clearEvents">Clear All</button>
    </div>

    <div class="events">
      <h4>Active Events ({{ emitter.getEventNames().length }}):</h4>
      <ul>
        <li v-for="event in emitter.getEventNames()" :key="event">
          {{ event }} ({{ emitter.getListeners(event).length }} listeners)
        </li>
      </ul>
    </div>

    <div class="logs">
      <h4>Event Log:</h4>
      <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
        {{ log }}
      </div>
    </div>

    <div class="scoped">
      <h4>Scoped Emitter Demo:</h4>
      <button @click="useScopedEmitter">Use Scoped Emitter</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEventEmitter } from './useEventEmitter'

const emitter = useEventEmitter()
const eventName = ref('test-event')
const eventData = ref('{"message": "hello"}')
const logs = ref([])

function log(message) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (logs.value.length > 10) logs.value.shift()
}

function triggerEvent() {
  try {
    const data = eventData.value ? JSON.parse(eventData.value) : {}
    emitter.emit(eventName.value, data)
    log(`Emitted "${eventName.value}" with data: ${JSON.stringify(data)}`)
  } catch (error) {
    log(`Error emitting event: ${error.message}`)
  }
}

function listenToEvent() {
  const unsubscribe = emitter.on(eventName.value, (data) => {
    log(`Received "${eventName.value}": ${JSON.stringify(data)}`)
  })

  log(`Started listening to "${eventName.value}"`)

  // Auto-unsubscribe after 30 seconds
  setTimeout(unsubscribe, 30000)
}

function clearEvents() {
  emitter.clear()
  log('Cleared all events')
}

function useScopedEmitter() {
  const userEmitter = emitter.createScopedEmitter('user')

  userEmitter.on('login', (user) => {
    log(`Scoped: User logged in: ${user.name}`)
  })

  userEmitter.on('logout', () => {
    log('Scoped: User logged out')
  })

  // Simulate events
  setTimeout(() => {
    userEmitter.emit('login', { name: 'John Doe' })
  }, 1000)

  setTimeout(() => {
    userEmitter.emit('logout')
  }, 2000)
}
</script>
