---
order: 7
---

# Vue.js Frontend Setup with Tauri

Setting up Vue.js as the frontend for your Tauri application provides a powerful combination of Vue's reactive framework with Tauri's secure Rust backend. This article covers the complete setup process and best practices.

## Prerequisites

- Node.js 16+ and npm/yarn
- Rust 1.70+ with `rustup`
- Tauri CLI: `cargo install tauri-cli`

## Creating a New Tauri + Vue.js Project

### Method 1: Using create-tauri-app (Recommended)

```bash
npm create tauri-app@latest
```

Follow the prompts:
- **Project name**: your-vue-app
- **Frontend framework**: Vue.js
- **Package manager**: npm/yarn/pnpm
- **UI library**: Choose based on your needs (or None)

### Method 2: Manual Setup

```bash
# Create Vue.js project
npm create vue@latest your-vue-app
cd your-vue-app

# Add Tauri
npm install @tauri-apps/api
cargo install tauri-cli
npm run tauri init
```

## Project Structure

```
your-vue-app/
├── src/                    # Vue.js source
│   ├── components/         # Vue components
│   ├── views/             # Vue pages
│   ├── App.vue            # Root component
│   └── main.js            # Vue entry point
├── src-tauri/             # Tauri backend
│   ├── src/
│   │   ├── main.rs        # Tauri entry
│   │   └── commands.rs    # Backend commands
│   └── Cargo.toml
├── package.json
└── tauri.conf.json        # Tauri configuration
```

## Vue.js Configuration

### Main.js Setup

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Router setup
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/settings', component: () => import('./views/Settings.vue') }
  ]
})

// Pinia store setup
const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
```

### Tauri Configuration

Update `tauri.conf.json` for Vue.js development:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Your Vue App",
    "version": "0.1.0"
  }
}
```

## Essential Dependencies

### Core Vue.js Ecosystem

```bash
# Vue Router for navigation
npm install vue-router@4

# Pinia for state management
npm install pinia

# VueUse for composition utilities
npm install @vueuse/core

# Tauri API for backend communication
npm install @tauri-apps/api
```

### UI Libraries (Optional)

```bash
# Element Plus
npm install element-plus

# Vuetify
npm install vuetify

# Quasar
npm install @quasar/extras
```

## Basic Vue.js + Tauri Integration

### Creating a Tauri Command

```rust
// src-tauri/src/commands.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GreetingResponse {
    message: String,
    timestamp: u64,
}

#[tauri::command]
pub async fn greet(name: String) -> Result<GreetingResponse, String> {
    let response = GreetingResponse {
        message: format!("Hello, {}! Welcome to Tauri + Vue.js!", name),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };
    
    Ok(response)
}
```

### Vue.js Component Integration

```vue
<!-- src/components/Greeting.vue -->
<template>
  <div class="greeting">
    <h2>Tauri + Vue.js Integration</h2>
    
    <div class="input-group">
      <input 
        v-model="name" 
        placeholder="Enter your name"
        @keyup.enter="greetUser"
      />
      <button @click="greetUser" :disabled="loading">
        {{ loading ? 'Loading...' : 'Greet' }}
      </button>
    </div>
    
    <div v-if="response" class="response">
      <p><strong>Message:</strong> {{ response.message }}</p>
      <p><strong>Timestamp:</strong> {{ formatDate(response.timestamp) }}</p>
    </div>
    
    <div v-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const name = ref('')
const response = ref(null)
const error = ref(null)
const loading = ref(false)

const greetUser = async () => {
  if (!name.value.trim()) return
  
  loading.value = true
  error.value = null
  
  try {
    const result = await invoke('greet', { name: name.value })
    response.value = result
  } catch (err) {
    error.value = err.toString()
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString()
}
</script>

<style scoped>
.greeting {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-group button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.response {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 4px;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background: #fee;
  border-radius: 4px;
  color: #c00;
}
</style>
```

## Development Workflow

### Running the Application

```bash
# Start development server
npm run tauri dev

# Or separately
npm run dev    # Vue.js dev server
cargo tauri dev  # Tauri backend
```

### Building for Production

```bash
# Build Vue.js frontend and Tauri backend
npm run tauri build

# Output in src-tauri/target/release/
```

## Hot Module Replacement (HMR)

Vue.js provides excellent HMR support. When you make changes to Vue components, they update automatically without full page reloads.

### Enabling HMR

Ensure your `vite.config.js` is properly configured:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true
  },
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_']
})
```

## Best Practices

### 1. Component Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── composables/         # Vue composition functions
├── stores/             # Pinia stores
└── utils/              # Utility functions
```

### 2. Tauri API Wrappers

Create composable functions for Tauri commands:

```javascript
// src/composables/useTauri.js
import { invoke } from '@tauri-apps/api/tauri'
import { ref } from 'vue'

export function useTauriCommand(commandName) {
  const loading = ref(false)
  const error = ref(null)
  
  const execute = async (args = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await invoke(commandName, args)
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    execute
  }
}
```

### 3. Error Handling

Implement comprehensive error handling:

```vue
<script setup>
import { useTauriCommand } from '@/composables/useTauri'

const { loading, error, execute } = useTauriCommand('greet')

const handleGreet = async () => {
  try {
    await execute({ name: 'Vue.js User' })
  } catch (err) {
    console.error('Command failed:', err)
  }
}
</script>
```

### 4. TypeScript Support

For better type safety, use TypeScript:

```bash
npm create vue@latest your-vue-app -- --typescript
```

```typescript
// src/types/tauri.ts
export interface GreetingResponse {
  message: string
  timestamp: number
}

// src/composables/useTauri.ts
import { invoke } from '@tauri-apps/api/tauri'
import { ref } from 'vue'
import type { GreetingResponse } from '@/types/tauri'

export function useGreeting() {
  const response = ref<GreetingResponse | null>(null)
  const loading = ref(false)
  
  const greet = async (name: string): Promise<GreetingResponse> => {
    loading.value = true
    try {
      const result = await invoke<GreetingResponse>('greet', { name })
      response.value = result
      return result
    } finally {
      loading.value = false
    }
  }
  
  return { response, loading, greet }
}
```

## Next Steps

With Vue.js and Tauri properly set up, you can now:

1. **Build reactive UI components** that communicate with Rust backend
2. **Implement state management** with Pinia
3. **Create routing** for multi-page applications
4. **Add UI libraries** for better design
5. **Handle file operations** and system integration

The combination of Vue.js's reactive framework and Tauri's secure backend provides an excellent foundation for building modern desktop applications.