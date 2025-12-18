# Vue.js Components for Tauri Applications

Creating reusable Vue.js components that interact with Tauri commands is fundamental to building robust desktop applications. This article covers patterns and best practices for developing Tauri-aware Vue components.

## Basic Tauri-Aware Components

### Simple Command Component

```vue
<template>
  <div class="greeting-component">
    <h3>Greeting Component</h3>
    <input
      v-model="nameInput"
      placeholder="Enter your name"
      @keyup.enter="greet"
    />
    <button @click="greet" :disabled="loading">Greet</button>
    
    <div v-if="result" class="result">
      {{ result }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const nameInput = ref('')
const result = ref(null)
const loading = ref(false)

const greet = async () => {
  if (!nameInput.value.trim()) return
  
  loading.value = true
  try {
    result.value = await invoke('greet', { name: nameInput.value })
  } catch (error) {
    console.error('Greeting failed:', error)
    result.value = `Error: ${error}`
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.greeting-component {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
}
</style>
```

## Component Lifecycle and Tauri Events

### Handling Tauri Events in Components

```vue
<template>
  <div class="event-listener">
    <h3>Event Listener Component</h3>
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
  // Listen for Tauri events
  unlistenFn = await listen('greeting-event', (event) => {
    messages.value.push(event.payload)
  })
})

onUnmounted(() => {
  // Clean up event listener when component unmounts
  if (unlistenFn) {
    unlistenFn()
  }
})
</script>
```

## Advanced Component Patterns

### Loading and Error Handling Component

```vue
<template>
  <div class="data-fetcher">
    <div v-if="loading" class="loading">
      Loading data...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="data" class="data">
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    
    <button @click="fetchData">Refresh</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    data.value = await invoke('fetch_data')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### File Explorer Component

```vue
<template>
  <div class="file-explorer">
    <div class="toolbar">
      <button @click="refreshDirectory">Refresh</button>
      <button @click="goBack" :disabled="!canGoBack">Back</button>
    </div>
    
    <div class="current-path">
      Current: {{ currentPath }}
    </div>
    
    <div class="files">
      <div
        v-for="file in files"
        :key="file.path"
        class="file-item"
        :class="{ directory: file.isDirectory }"
        @click="handleFileClick(file)"
      >
        <span class="icon">{{ file.isDirectory ? '📁' : '📄' }}</span>
        <span class="name">{{ file.name }}</span>
        <span v-if="!file.isDirectory" class="size">{{ formatSize(file.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const files = ref([])
const currentPath = ref('/')
const pathStack = ref(['/'])

const loading = ref(false)
const error = ref(null)

const refreshDirectory = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await invoke('read_directory', { path: currentPath.value })
    files.value = result
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleFileClick = async (file) => {
  if (file.isDirectory) {
    // Navigate to directory
    const newPath = `${currentPath.value}/${file.name}`.replace('//', '/')
    currentPath.value = newPath
    pathStack.value.push(newPath)
    await refreshDirectory()
  } else {
    // Handle file click
    console.log('Opening file:', file.path)
  }
}

const goBack = async () => {
  if (pathStack.value.length > 1) {
    pathStack.value.pop()
    currentPath.value = pathStack.value[pathStack.value.length - 1]
    await refreshDirectory()
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const canGoBack = computed(() => pathStack.value.length > 1)

// Initialize
refreshDirectory()
</script>

<style scoped>
.file-explorer {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
}

.toolbar {
  margin-bottom: 15px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f5f5f5;
}

.directory {
  background: #f0f9ff;
}

.size {
  margin-left: auto;
  color: #666;
  font-size: 0.9em;
}

.current-path {
  margin-bottom: 15px;
  font-weight: bold;
}
</style>
```

## Component Communication with Tauri Commands

### Command Wrapper Component

```vue
<template>
  <div class="command-wrapper">
    <slot
      :execute="execute"
      :loading="loading"
      :error="error"
      :result="result"
    ></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const props = defineProps({
  command: String,
  args: Object
})

const result = ref(null)
const loading = ref(false)
const error = ref(null)

const execute = async (args = props.args) => {
  loading.value = true
  error.value = null
  
  try {
    result.value = await invoke(props.command, args)
    return result.value
  } catch (err) {
    error.value = err
    throw err
  } finally {
    loading.value = false
  }
}

defineExpose({ execute })
</script>
```

## Best Practices

### 1. Error Handling
- Always handle Tauri command errors gracefully
- Provide user-friendly error messages
- Log errors for debugging

### 2. Loading States
- Implement proper loading states for async operations
- Disable UI elements during operations
- Provide visual feedback to users

### 3. Component Reusability
- Create generic Tauri command components
- Use slots for flexible content
- Parameterize command names and arguments

### 4. Cleanup
- Properly clean up event listeners
- Cancel pending operations when components unmount
- Manage state properly across component lifecycles

### 5. Type Safety (with TypeScript)

```typescript
// types.ts
export interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modified?: number
}

// Component with TypeScript
<script setup lang="ts">
import type { FileInfo } from './types'

const files = ref<FileInfo[]>([])
</script>
```

Creating Tauri-aware Vue components requires careful attention to lifecycle management, error handling, and state management. Following these patterns will help you build robust, maintainable components that interact seamlessly with your Tauri backend.