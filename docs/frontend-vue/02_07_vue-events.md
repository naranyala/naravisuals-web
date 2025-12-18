# Events

Tauri events provide powerful real-time communication between the backend and frontend. This article covers patterns for handling Tauri events in Vue.js applications, creating reactive data from backend events, and managing event subscriptions effectively.

## Understanding Tauri Events

### Event Architecture

Tauri events follow a publish-subscribe pattern where the Rust backend emits events that can be listened to by the frontend:

```
Frontend (Vue.js) ← Listen ← Tauri Event System ← Emit → Backend (Rust)
```

### Basic Event Listen Pattern

```vue
<template>
  <div class="event-demo">
    <h2>Event Demo</h2>
    <div class="messages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        class="message"
      >
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { listen } from '@tauri-apps/api/event'

const messages = ref([])

let unlistenFn = null

onMounted(async () => {
  // Listen for events from backend
  unlistenFn = await listen('greeting', (event) => {
    messages.value.push(event.payload.message)
  })
})

onUnmounted(() => {
  // Clean up event listener
  if (unlistenFn) {
    unlistenFn()
  }
})
</script>
```

## Backend Event Emission

### Rust Event Emission Example

```rust
// src-tauri/src/main.rs
use tauri::{AppHandle, Manager};
use serde::Serialize;

#[derive(Serialize)]
struct GreetingPayload {
    message: String,
    timestamp: u64,
}

#[tauri::command]
async fn trigger_greeting(
    message: String,
    app_handle: AppHandle
) -> Result<(), String> {
    let payload = GreetingPayload {
        message: format!("Hello, {}!", message),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    // Emit event to all windows
    app_handle.emit("greeting", payload)
        .map_err(|e| e.to_string())?;

    Ok(())
}
```

## Advanced Event Patterns

### Event Manager Composable

```javascript
// composables/useEventManager.js
import { ref, onUnmounted } from 'vue'
import { listen } from '@tauri-apps/api/event'

export function useEventManager() {
  const listeners = ref(new Map())
  
  const subscribe = async (event, handler) => {
    const unlisten = await listen(event, handler)
    const id = Symbol(event)
    listeners.value.set(id, { unlisten, event, handler })
    
    return id
  }
  
  const unsubscribe = (id) => {
    if (listeners.value.has(id)) {
      const { unlisten } = listeners.value.get(id)
      unlisten()
      listeners.value.delete(id)
    }
  }
  
  const unsubscribeAll = () => {
    listeners.value.forEach(({ unlisten }) => unlisten())
    listeners.value.clear()
  }
  
  // Clean up on component unmount
  onUnmounted(unsubscribeAll)
  
  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
    listeners
  }
}
```

### Using Event Manager

```vue
<template>
  <div class="event-manager-demo">
    <div class="status">Active listeners: {{ listenerCount }}</div>
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        {{ msg.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEventManager } from '@/composables/useEventManager'

const { subscribe, unsubscribe, listeners } = useEventManager()
const messages = ref([])

// Computed for active listener count
const listenerCount = computed(() => listeners.value.size)

// Subscribe to multiple events
const greetingId = await subscribe('greeting', (event) => {
  messages.value.push({
    id: Date.now(),
    content: `Greeting: ${event.payload.message}`,
    timestamp: event.payload.timestamp
  })
})

const fileUpdateId = await subscribe('file-update', (event) => {
  messages.value.push({
    id: Date.now(),
    content: `File updated: ${event.payload.filename}`,
    timestamp: event.payload.timestamp
  })
})
</script>
```

## Reactive Data from Events

### Creating Reactive Stores from Events

```javascript
// stores/eventStore.js
import { defineStore } from 'pinia'
import { listen } from '@tauri-apps/api/event'

export const useEventStore = defineStore('events', {
  state: () => ({
    notifications: [],
    systemStatus: 'unknown',
    activeListeners: new Map()
  }),
  
  actions: {
    async initEventListeners() {
      // Subscribe to system status events
      const statusUnlisten = await listen('system-status', (event) => {
        this.systemStatus = event.payload.status
      })
      this.activeListeners.set('system-status', statusUnlisten)
      
      // Subscribe to notification events
      const notificationUnlisten = await listen('notification', (event) => {
        this.notifications.push({
          id: Date.now(),
          type: event.payload.type,
          message: event.payload.message,
          timestamp: new Date().toISOString()
        })
        
        // Keep only recent notifications
        if (this.notifications.length > 50) {
          this.notifications = this.notifications.slice(-50)
        }
      })
      this.activeListeners.set('notification', notificationUnlisten)
    },
    
    async cleanupEventListeners() {
      this.activeListeners.forEach((unlisten, event) => {
        unlisten()
      })
      this.activeListeners.clear()
    }
  },
  
  getters: {
    recentNotifications: (state) => {
      return state.notifications.slice(-10)
    },
    hasActiveNotifications: (state) => {
      return state.notifications.length > 0
    }
  }
})
```

## Event-Driven State Management

### Window-Specific Events

```vue
<template>
  <div class="window-events">
    <div class="window-title">{{ windowTitle }}</div>
    <div class="window-state">{{ windowState }}</div>
    <button @click="changeWindowState">Change State</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'

const windowTitle = ref('')
const windowState = ref('')

let unlistenTitle = null
let unlistenState = null

onMounted(async () => {
  // Listen for window title changes
  unlistenTitle = await listen('window-title-changed', (event) => {
    windowTitle.value = event.payload.title
  })
  
  // Listen for window state changes
  unlistenState = await listen('tauri://window-created', (event) => {
    windowState.value = 'created'
  })
  
  // Listen for minimize/maximize events
  await listen('tauri://window-minimized', () => {
    windowState.value = 'minimized'
  })
  
  await listen('tauri://window-maximized', () => {
    windowState.value = 'maximized'
  })
  
  await listen('tauri://window-restored', () => {
    windowState.value = 'restored'
  })
})

const changeWindowState = () => {
  appWindow.toggleMaximize()
}

onUnmounted(() => {
  if (unlistenTitle) unlistenTitle()
  if (unlistenState) unlistenState()
})
</script>
```

## Event Filtering and Transformation

### Event Processor Composable

```javascript
// composables/useEventProcessor.js
import { ref } from 'vue'
import { listen } from '@tauri-apps/api/event'

export function useEventProcessor() {
  const events = ref([])
  const filteredEvents = ref([])
  const latestEvent = ref(null)
  
  const subscribe = async (event, options = {}) => {
    const { 
      filter = null, 
      transform = null, 
      limit = 100 
    } = options
    
    return await listen(event, (e) => {
      let processedEvent = e
      
      // Apply transformation if provided
      if (transform) {
        processedEvent = transform(e)
      }
      
      // Apply filter if provided
      if (filter && !filter(processedEvent)) {
        return
      }
      
      // Update latest event
      latestEvent.value = processedEvent
      
      // Add to event history
      events.value.push(processedEvent)
      
      // Apply limit
      if (events.value.length > limit) {
        events.value = events.value.slice(-limit)
      }
      
      // Update filtered events if filter exists
      if (filter) {
        filteredEvents.value = events.value.filter(filter)
      }
    })
  }
  
  const clearEvents = () => {
    events.value = []
    filteredEvents.value = []
    latestEvent.value = null
  }
  
  return {
    events,
    filteredEvents,
    latestEvent,
    subscribe,
    clearEvents
  }
}
```

### Using Event Processor

```vue
<template>
  <div class="event-processor-demo">
    <h3>Event Processor Demo</h3>
    
    <div class="event-controls">
      <button @click="clearAllEvents">Clear Events</button>
    </div>
    
    <div class="event-stats">
      <p>Total Events: {{ events.length }}</p>
      <p>Filtered Events: {{ filteredEvents.length }}</p>
      <p>Last Event: {{ latestEvent?.payload?.message || 'None' }}</p>
    </div>
    
    <div class="events-list">
      <div 
        v-for="(event, index) in events.slice().reverse()" 
        :key="index"
        class="event-item"
      >
        <strong>{{ event.event }}</strong>: {{ event.payload?.message }}
        <small>{{ new Date(event.payload?.timestamp).toLocaleTimeString() }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEventProcessor } from '@/composables/useEventProcessor'

const { 
  events, 
  filteredEvents, 
  latestEvent, 
  subscribe, 
  clearEvents: clearAllEvents 
} = useEventProcessor()

// Subscribe with filtering and transformation
subscribe('data-update', {
  filter: (event) => event.payload.priority === 'high',
  transform: (event) => ({
    ...event,
    processedAt: Date.now()
  }),
  limit: 50
})
</script>
```

## Real-time Data Synchronization

### File Watching with Events

```javascript
// composables/useFileWatcher.js
import { ref, onUnmounted } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

export function useFileWatcher() {
  const watchedFiles = ref([])
  const fileChanges = ref([])
  const listeners = ref([])
  
  const startWatching = async (filePath) => {
    // Start watching the file from backend
    await invoke('start_file_watcher', { path: filePath })
    
    // Listen for change events
    const unlisten = await listen(`file-changed-${filePath}`, (event) => {
      const change = {
        path: filePath,
        type: event.payload.type,
        timestamp: Date.now(),
        content: event.payload.content
      }
      
      fileChanges.value.unshift(change)
      
      // Keep only recent changes
      if (fileChanges.value.length > 100) {
        fileChanges.value = fileChanges.value.slice(0, 100)
      }
    })
    
    listeners.value.push(unlisten)
    watchedFiles.value.push(filePath)
  }
  
  const stopWatching = async (filePath) => {
    await invoke('stop_file_watcher', { path: filePath })
    
    // Remove from watched files
    watchedFiles.value = watchedFiles.value.filter(f => f !== filePath)
  }
  
  const stopAll = async () => {
    // Stop all file watchers
    for (const file of watchedFiles.value) {
      await invoke('stop_file_watcher', { path: file })
    }
    
    // Remove all listeners
    listeners.value.forEach(unlisten => unlisten())
    listeners.value = []
    watchedFiles.value = []
  }
  
  onUnmounted(stopAll)
  
  return {
    watchedFiles,
    fileChanges,
    startWatching,
    stopWatching,
    stopAll
  }
}
```

### Real-time File Monitoring Component

```vue
<template>
  <div class="file-monitor">
    <h3>File Monitor</h3>
    
    <div class="watch-controls">
      <input 
        v-model="watchPath" 
        placeholder="Enter file path to watch"
      />
      <button @click="addWatchPath">Watch File</button>
    </div>
    
    <div class="watched-files">
      <div 
        v-for="file in watchedFiles" 
        :key="file"
        class="watched-file"
      >
        <span>{{ file }}</span>
        <button @click="stopWatching(file)">Stop</button>
      </div>
    </div>
    
    <div class="file-changes">
      <h4>Recent Changes</h4>
      <div class="change-log">
        <div 
          v-for="change in fileChanges.slice(0, 10)" 
          :key="`${change.path}-${change.timestamp}`"
          class="change-item"
        >
          <span class="file-path">{{ change.path }}</span>
          <span class="change-type">{{ change.type }}</span>
          <span class="timestamp">{{ formatDate(change.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFileWatcher } from '@/composables/useFileWatcher'

const watchPath = ref('')
const { watchedFiles, fileChanges, startWatching, stopWatching } = useFileWatcher()

const addWatchPath = () => {
  if (watchPath.value.trim()) {
    startWatching(watchPath.value.trim())
    watchPath.value = ''
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>
```

## Event-Based Communication Patterns

### Command Response Pattern

```vue
<template>
  <div class="command-responder">
    <button @click="executeLongRunningOperation">
      Execute Long Operation
    </button>
    
    <div v-if="isRunning" class="progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <span>{{ progress }}%</span>
    </div>
    
    <div v-if="result" class="result">
      {{ result }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

const isRunning = ref(false)
const progress = ref(0)
const result = ref(null)

let progressUnlisten = null
let resultUnlisten = null

onMounted(async () => {
  // Listen for progress events
  progressUnlisten = await listen('operation-progress', (event) => {
    progress.value = event.payload.progress
  })
  
  // Listen for completion events
  resultUnlisten = await listen('operation-complete', (event) => {
    isRunning.value = false
    result.value = event.payload.result
  })
})

const executeLongRunningOperation = async () => {
  isRunning.value = true
  progress.value = 0
  result.value = null
  
  try {
    // Start long-running operation
    await invoke('start_long_operation')
  } catch (error) {
    isRunning.value = false
    result.value = `Error: ${error.message}`
  }
}

onUnmounted(() => {
  if (progressUnlisten) progressUnlisten()
  if (resultUnlisten) resultUnlisten()
})
</script>
```

## Global Event Bus Pattern

### Application-Level Event Bus

```javascript
// stores/eventBus.js
import { defineStore } from 'pinia'

export const useEventBus = defineStore('eventBus', {
  state: () => ({
    events: [],
    listeners: new Map()
  }),
  
  actions: {
    emit(eventType, payload) {
      // Store event for later retrieval
      this.events.push({
        type: eventType,
        payload,
        timestamp: Date.now()
      })
      
      // Keep last 100 events
      if (this.events.length > 100) {
        this.events = this.events.slice(-100)
      }
      
      // Notify listeners
      const listeners = this.listeners.get(eventType) || []
      listeners.forEach(callback => {
        try {
          callback(payload)
        } catch (error) {
          console.error('Event handler error:', error)
        }
      })
    },
    
    on(eventType, callback) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, [])
      }
      
      const listeners = this.listeners.get(eventType)
      listeners.push(callback)
      
      // Return unsubscribe function
      return () => {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    },
    
    off(eventType, callback) {
      if (this.listeners.has(eventType)) {
        const listeners = this.listeners.get(eventType)
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }
})
```

### Using Global Event Bus

```vue
<template>
  <div class="event-bus-demo">
    <button @click="triggerEvent">Trigger Global Event</button>
    
    <div class="received-events">
      <h4>Received Events:</h4>
      <div v-for="event in recentEvents" :key="event.timestamp" class="event-item">
        {{ event.type }}: {{ JSON.stringify(event.payload) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useEventBus } from '@/stores/eventBus'

const { on, emit, events } = useEventBus()
const recentEvents = ref([])
let unsubscribe = null

onMounted(() => {
  // Subscribe to all events
  unsubscribe = on('*', (payload, type) => {
    recentEvents.value.unshift({
      type,
      payload,
      timestamp: Date.now()
    })
    
    // Keep only recent events
    if (recentEvents.value.length > 10) {
      recentEvents.value = recentEvents.value.slice(0, 10)
    }
  })
})

const triggerEvent = () => {
  emit('user-action', {
    action: 'click',
    component: 'event-bus-demo',
    timestamp: Date.now()
  })
}

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
```

## Performance Considerations

### Event Batching

```javascript
// utils/eventBatcher.js
export class EventBatcher {
  constructor(callback, delay = 100) {
    this.callback = callback
    this.delay = delay
    this.pendingEvents = []
    this.timeoutId = null
  }
  
  add(event) {
    this.pendingEvents.push(event)
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    
    this.timeoutId = setTimeout(() => {
      this.flush()
    }, this.delay)
  }
  
  flush() {
    if (this.pendingEvents.length > 0) {
      this.callback(this.pendingEvents)
      this.pendingEvents = []
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
  
  destroy() {
    this.flush()
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }
}
```

## Testing Event Systems

### Event Testing Utilities

```javascript
// tests/utils/eventMocks.js
import { vi } from 'vitest'

export const createEventMock = () => {
  const handlers = new Map()
  const emittedEvents = []
  
  return {
    listen: vi.fn().mockImplementation(async (event, handler) => {
      if (!handlers.has(event)) {
        handlers.set(event, [])
      }
      handlers.get(event).push(handler)
      
      return vi.fn() // unlisten function
    }),
    
    emit: vi.fn().mockImplementation((event, payload) => {
      emittedEvents.push({ event, payload })
      
      if (handlers.has(event)) {
        handlers.get(event).forEach(handler => {
          handler({ event, payload })
        })
      }
    }),
    
    getEmitted: () => [...emittedEvents],
    
    clear: () => {
      emittedEvents.length = 0
      handlers.clear()
    },
    
    simulateEvent: (event, payload) => {
      if (handlers.has(event)) {
        handlers.get(event).forEach(handler => {
          handler({ event, payload })
        })
      }
    }
  }
}
```

### Testing Event Components

```javascript
// tests/unit/EventComponent.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EventComponent from '@/components/EventComponent.vue'
import { createEventMock } from '../utils/eventMocks'

vi.mock('@tauri-apps/api/event')

describe('EventComponent', () => {
  it('responds to events', async () => {
    const eventMock = createEventMock()
    vi.mocked(listen).mockImplementation(eventMock.listen)
    
    const wrapper = mount(EventComponent)
    
    // Simulate receiving an event
    eventMock.simulateEvent('data-update', { message: 'Test data' })
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Test data')
  })
  
  it('cleans up event listeners', async () => {
    const unlistenMock = vi.fn()
    vi.mocked(listen).mockResolvedValue(unlistenMock)
    
    const wrapper = mount(EventComponent)
    wrapper.unmount()
    
    expect(unlistenMock).toHaveBeenCalled()
  })
})
```

## Best Practices

### 1. Event Naming Conventions

```javascript
// Use consistent naming patterns
const EVENT_TYPES = {
  SYSTEM: {
    STATUS_UPDATE: 'system-status-update',
    ERROR: 'system-error',
    READY: 'system-ready'
  },
  DATA: {
    CREATE: 'data-created',
    UPDATE: 'data-updated', 
    DELETE: 'data-deleted'
  },
  USER: {
    LOGIN: 'user-logged-in',
    LOGOUT: 'user-logged-out',
    ACTION: 'user-action'
  }
}
```

### 2. Proper Cleanup

```javascript
// Always clean up event listeners
onUnmounted(() => {
  if (unlistenFn) {
    unlistenFn()
  }
})
```

### 3. Error Handling

```javascript
const subscribeWithErrorHandling = async (event, handler) => {
  try {
    const unlisten = await listen(event, (payload) => {
      try {
        handler(payload)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
    return unlisten
  } catch (error) {
    console.error(`Failed to subscribe to ${event}:`, error)
    throw error
  }
}
```

### 4. Event Payload Validation

```javascript
const validatedEventHandler = (expectedSchema) => (event) => {
  if (!validatePayload(event.payload, expectedSchema)) {
    console.warn('Invalid event payload received:', event.payload)
    return
  }
  
  // Process valid payload
  handleValidEvent(event)
}
```

Event-driven communication is a powerful feature in Tauri applications that enables real-time updates and responsive UIs. Properly managing event subscriptions and creating reactive data flows will enhance your application's user experience.