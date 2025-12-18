---
title: State Management
description: State management in Tauri applications using Pinia.
order: 2
difficulty: intermediate
tags: [state-management, pinia, vue, stores, typescript]
---

# Vue.js State Management with Pinia in Tauri

State management is crucial for building maintainable Vue.js applications, especially when working with Tauri's backend commands. Pinia provides an excellent solution for managing application state with TypeScript support and excellent developer experience, making it the perfect choice for Tauri desktop applications.

## Why Pinia for Tauri Applications?

Pinia is the official state management library for Vue.js and offers several advantages for Tauri applications:

- **TypeScript support** with full type inference and autocompletion
- **Lightweight** and minimal boilerplate compared to Vuex
- **Excellent DevTools** integration for debugging state changes
- **Modular store design** perfect for organizing Tauri command responses
- **Composition API friendly** with intuitive reactive patterns
- **Server-side rendering compatibility** for future extensibility
- **Hot module replacement** support for better development experience

## Setting Up Pinia

### Installation

```bash
npm install pinia
# or
yarn add pinia
# or
pnpm add pinia
```

### TypeScript Support (Recommended)

```bash
npm install pinia @types/node
```

### Basic Setup

```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

### TypeScript Setup

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import App from './App.vue'
import { invoke } from '@tauri-apps/api/tauri'

const app = createApp(App)
const pinia: Pinia = createPinia()

// Provide Tauri API to all stores
app.provide('tauri', { invoke })

app.use(pinia)
app.mount('#app')
```

## Store Structure for Tauri Applications

### Organizing Stores by Feature

Create stores that correspond to your backend command categories:

```
src/stores/
├── auth.ts           # Authentication state
├── files.ts          # File management state
├── settings.ts       # Application settings
├── notifications.ts  # System notifications
└── index.ts         # Store exports
```

### Organizing Stores by Feature

```
src/
├── stores/
│   ├── auth.js           # Authentication state
│   ├── settings.js       # Application settings
│   ├── files.js          # File operations state
│   └── database.js       # Database operations state
```

### Basic Store Example

```javascript
// src/stores/greeting.js
import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/tauri'

export const useGreetingStore = defineStore('greeting', {
  state: () => ({
    name: '',
    message: '',
    timestamp: null,
    loading: false,
    error: null
  }),
  
  getters: {
    hasMessage: (state) => !!state.message,
    formattedTimestamp: (state) => {
      return state.timestamp 
        ? new Date(state.timestamp * 1000).toLocaleString()
        : null
    }
  },
  
  actions: {
    async greetUser(userName) {
      this.loading = true
      this.error = null
      
      try {
        const response = await invoke('greet', { name: userName })
        this.name = userName
        this.message = response.message
        this.timestamp = response.timestamp
      } catch (error) {
        this.error = error.toString()
        throw error
      } finally {
        this.loading = false
      }
    },
    
    clearMessage() {
      this.message = ''
      this.timestamp = null
      this.error = null
    }
  }
})
```

## Advanced Store Patterns

### Composition API Store

```javascript
// src/stores/files.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

export const useFilesStore = defineStore('files', () => {
  // State
  const files = ref([])
  const currentPath = ref('/')
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const fileCount = computed(() => files.value.length)
  const directories = computed(() => 
    files.value.filter(file => file.is_directory)
  )
  const regularFiles = computed(() => 
    files.value.filter(file => !file.is_directory)
  )
  
  // Actions
  async function loadDirectory(path = currentPath.value) {
    loading.value = true
    error.value = null
    
    try {
      const fileList = await invoke('read_directory', { path })
      files.value = fileList
      currentPath.value = path
    } catch (err) {
      error.value = err.toString()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function createFile(name, content = '') {
    try {
      await invoke('create_file', {
        path: `${currentPath.value}/${name}`,
        content
      })
      await loadDirectory() // Refresh the file list
    } catch (err) {
      error.value = err.toString()
      throw err
    }
  }
  
  async function deleteFile(name) {
    try {
      await invoke('delete_file', {
        path: `${currentPath.value}/${name}`
      })
      await loadDirectory() // Refresh the file list
    } catch (err) {
      error.value = err.toString()
      throw err
    }
  }
  
  function setCurrentPath(path) {
    currentPath.value = path
  }
  
  return {
    // State
    files,
    currentPath,
    loading,
    error,
    
    // Getters
    fileCount,
    directories,
    regularFiles,
    
    // Actions
    loadDirectory,
    createFile,
    deleteFile,
    setCurrentPath
  }
})
```

### Settings Store with Persistence

```javascript
// src/stores/settings.js
import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/tauri'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30, // seconds
    windowSize: { width: 800, height: 600 },
    recentFiles: [],
    loading: false,
    error: null
  }),
  
  getters: {
    isDarkTheme: (state) => state.theme === 'dark',
    autoSaveIntervalMs: (state) => state.autoSaveInterval * 1000
  },
  
  actions: {
    async loadSettings() {
      this.loading = true
      try {
        const settings = await invoke('load_settings')
        this.$patch(settings)
      } catch (error) {
        this.error = error.toString()
        // Use defaults if settings file doesn't exist
        console.warn('Using default settings:', error)
      } finally {
        this.loading = false
      }
    },
    
    async saveSettings() {
      try {
        await invoke('save_settings', { settings: this.$state })
      } catch (error) {
        this.error = error.toString()
        throw error
      }
    },
    
    async updateTheme(theme) {
      this.theme = theme
      await this.saveSettings()
    },
    
    async updateLanguage(language) {
      this.language = language
      await this.saveSettings()
    },
    
    async toggleAutoSave() {
      this.autoSave = !this.autoSave
      await this.saveSettings()
    },
    
    async updateAutoSaveInterval(interval) {
      this.autoSaveInterval = interval
      await this.saveSettings()
    },
    
    addRecentFile(filePath) {
      // Remove if already exists
      this.recentFiles = this.recentFiles.filter(file => file !== filePath)
      // Add to beginning
      this.recentFiles.unshift(filePath)
      // Keep only last 10 files
      this.recentFiles = this.recentFiles.slice(0, 10)
      this.saveSettings()
    },
    
    clearRecentFiles() {
      this.recentFiles = []
      this.saveSettings()
    }
  }
})
```

## Using Stores in Components

### Basic Usage

```vue
<!-- src/components/GreetingComponent.vue -->
<template>
  <div class="greeting">
    <h2>Greeting Store Example</h2>
    
    <div class="input-group">
      <input 
        v-model="inputName" 
        placeholder="Enter your name"
        @keyup.enter="handleGreet"
      />
      <button @click="handleGreet" :disabled="greetingStore.loading">
        {{ greetingStore.loading ? 'Loading...' : 'Greet' }}
      </button>
    </div>
    
    <div v-if="greetingStore.hasMessage" class="message">
      <p>{{ greetingStore.message }}</p>
      <small>{{ greetingStore.formattedTimestamp }}</small>
    </div>
    
    <div v-if="greetingStore.error" class="error">
      <p>{{ greetingStore.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGreetingStore } from '@/stores/greeting'

const greetingStore = useGreetingStore()
const inputName = ref('')

const handleGreet = async () => {
  if (!inputName.value.trim()) return
  
  try {
    await greetingStore.greetUser(inputName.value)
  } catch (error) {
    console.error('Greeting failed:', error)
  }
}
</script>
```

### File Manager Component

```vue
<!-- src/components/FileManager.vue -->
<template>
  <div class="file-manager">
    <div class="toolbar">
      <button @click="filesStore.loadDirectory()" :disabled="filesStore.loading">
        Refresh
      </button>
      <button @click="showCreateFileDialog">
        New File
      </button>
    </div>
    
    <div class="path">
      <span>Current: {{ filesStore.currentPath }}</span>
    </div>
    
    <div v-if="filesStore.loading" class="loading">
      Loading files...
    </div>
    
    <div v-else-if="filesStore.error" class="error">
      {{ filesStore.error }}
    </div>
    
    <div v-else class="file-list">
      <div class="stats">
        {{ filesStore.fileCount }} items | 
        {{ filesStore.directories.length }} directories | 
        {{ filesStore.regularFiles.length }} files
      </div>
      
      <div 
        v-for="file in filesStore.files" 
        :key="file.name"
        class="file-item"
        :class="{ directory: file.is_directory }"
        @click="handleFileClick(file)"
      >
        <span class="file-icon">
          {{ file.is_directory ? '📁' : '📄' }}
        </span>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size" v-if="!file.is_directory">
          {{ formatFileSize(file.size) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFilesStore } from '@/stores/files'

const filesStore = useFilesStore()

// Initialize with home directory
filesStore.loadDirectory()

const handleFileClick = async (file) => {
  if (file.is_directory) {
    await filesStore.loadDirectory(
      `${filesStore.currentPath}/${file.name}`
    )
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const showCreateFileDialog = () => {
  // Implementation for create file dialog
  const fileName = prompt('Enter file name:')
  if (fileName) {
    filesStore.createFile(fileName)
  }
}
</script>
```

## Store Composition and Reusability

### Creating Composable Functions

```javascript
// src/composables/useTauriStore.js
import { storeToRefs } from 'pinia'

export function useStoreWithLoading(storeName, actionName) {
  const store = useStore(storeName)
  const { loading, error } = storeToRefs(store)
  
  const executeAction = async (...args) => {
    try {
      await store[actionName](...args)
    } catch (err) {
      console.error(`${actionName} failed:`, err)
      throw err
    }
  }
  
  return {
    loading,
    error,
    executeAction
  }
}
```

### Shared Error Handling

```javascript
// src/composables/useErrorHandler.js
import { ref } from 'vue'

export function useErrorHandler() {
  const errors = ref([])
  
  const handleError = (error, context = '') => {
    const errorInfo = {
      message: error.toString(),
      context,
      timestamp: Date.now()
    }
    
    errors.value.push(errorInfo)
    console.error(`Error in ${context}:`, error)
  }
  
  const clearErrors = () => {
    errors.value = []
  }
  
  return {
    errors,
    handleError,
    clearErrors
  }
}
```

## TypeScript Support

### Typed Store Definition

```typescript
// src/types/stores.ts
export interface GreetingState {
  name: string
  message: string
  timestamp: number | null
  loading: boolean
  error: string | null
}

export interface FileInfo {
  name: string
  path: string
  is_directory: boolean
  size?: number
  modified?: number
}

// src/stores/greeting.ts
import { defineStore } from 'pinia'
import type { GreetingState } from '@/types/stores'

export const useGreetingStore = defineStore('greeting', {
  state: (): GreetingState => ({
    name: '',
    message: '',
    timestamp: null,
    loading: false,
    error: null
  }),
  
  getters: {
    hasMessage: (state): boolean => !!state.message
  },
  
  actions: {
    async greetUser(userName: string): Promise<void> {
      this.loading = true
      this.error = null
      
      try {
        const response = await invoke<{ message: string; timestamp: number }>(
          'greet', 
          { name: userName }
        )
        this.name = userName
        this.message = response.message
        this.timestamp = response.timestamp
      } catch (error) {
        this.error = error as string
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

## Best Practices

### 1. Store Organization

- **One store per feature/domain**
- **Keep stores focused and small**
- **Use composition for complex logic**

### 2. Error Handling

- **Centralize error handling in stores**
- **Provide user-friendly error messages**
- **Log errors for debugging**

### 3. Loading States

- **Always track loading states**
- **Provide visual feedback to users**
- **Handle concurrent requests properly**

### 4. Performance Optimization

- **Use computed selectors for derived data**
- **Avoid unnecessary reactivity**
- **Lazy load stores when possible**

### 5. Testing

```javascript
// tests/stores/greeting.test.js
import { setActivePinia, createPinia } from 'pinia'
import { useGreetingStore } from '@/stores/greeting'

describe('Greeting Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should greet user successfully', async () => {
    const store = useGreetingStore()
    
    await store.greetUser('Test User')
    
    expect(store.message).toContain('Test User')
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })
  
  it('should handle errors', async () => {
    const store = useGreetingStore()
    
    // Mock failed invoke
    vi.mock('@tauri-apps/api/tauri', () => ({
      invoke: vi.fn().mockRejectedValue(new Error('Test error'))
    }))
    
    await expect(store.greetUser('')).rejects.toThrow()
    expect(store.error).toBeTruthy()
  })
})
```

Pinia provides an excellent foundation for managing state in Tauri + Vue.js applications, offering type safety, excellent developer experience, and seamless integration with Tauri's backend commands.