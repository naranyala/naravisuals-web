# Vue.js Routing with Tauri

Routing in Tauri desktop applications requires special considerations compared to web applications. This article covers Vue Router integration with Tauri and best practices for building desktop application navigation.

## Basic Routing Setup

### Installing Vue Router

```bash
npm install vue-router@4
```

### Router Configuration

```javascript
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Settings from '@/views/Settings.vue'
import Files from '@/views/Files.vue'
import About from '@/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/files',
    name: 'Files',
    component: Files
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHashHistory(), // Important for Tauri
  routes
})

export default router
```

## Tauri-Specific Routing Considerations

### Why Hash History in Tauri

Tauri applications run from local files (file:// protocol), which means browser history API (createWebHistory) doesn't work as expected. Hash history (createWebHashHistory) is the recommended approach:

```javascript
// Correct for Tauri
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})

// Not recommended for Tauri
// const router = createRouter({
//   history: createWebHistory(),
//   routes: [...]
// })
```

### Main Application Setup

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
```

## Application Layout with Navigation

### Main Application Component

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        My Tauri App
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/files">Files</router-link>
        </li>
        <li>
          <router-link to="/settings">Settings</router-link>
        </li>
        <li>
          <router-link to="/about">About</router-link>
        </li>
      </ul>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Nothing needed here for basic routing
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav-links a {
  text-decoration: none;
  color: #495057;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-links a.router-link-active,
.nav-links a:hover {
  background: #e9ecef;
  color: #0d6efd;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}
</style>
```

## Advanced Routing Patterns

### Route Guards and Authentication

```javascript
// src/router/guards.js
import { invoke } from '@tauri-apps/api/tauri'
import { useAuthStore } from '@/stores/auth'

export async function checkAuth() {
  try {
    // Check if user is authenticated using Tauri command
    const isAuthenticated = await invoke('is_authenticated')
    return isAuthenticated
  } catch (error) {
    console.error('Auth check failed:', error)
    return false
  }
}

// src/router/index.js (updated)
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authenticated = await checkAuth()
    
    if (!authenticated) {
      next('/login') // Redirect to login page
    } else {
      next()
    }
  } else {
    next()
  }
})
```

### Dynamic Routes with Parameters

```javascript
// src/router/index.js (updated)
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/file/:id',
    name: 'FileDetail',
    component: FileDetail,
    props: true
  },
  {
    path: '/user/:username',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  }
]
```

### File Detail Component with Route Parameters

```vue
<!-- src/views/FileDetail.vue -->
<template>
  <div class="file-detail">
    <h2>File Details: {{ $route.params.id }}</h2>
    
    <div v-if="loading" class="loading">
      Loading file...
    </div>
    
    <div v-else-if="file" class="file-info">
      <h3>{{ file.name }}</h3>
      <p><strong>Path:</strong> {{ file.path }}</p>
      <p><strong>Size:</strong> {{ formatSize(file.size) }}</p>
      <p><strong>Modified:</strong> {{ formatDate(file.modified) }}</p>
      
      <div class="file-actions">
        <button @click="openFile">Open File</button>
        <button @click="editFile">Edit</button>
        <button @click="deleteFile">Delete</button>
      </div>
    </div>
    
    <div v-else class="error">
      File not found
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/tauri'

const route = useRoute()
const router = useRouter()

const file = ref(null)
const loading = ref(false)

const loadFile = async () => {
  loading.value = true
  try {
    file.value = await invoke('get_file_info', { 
      id: route.params.id 
    })
  } catch (error) {
    console.error('Failed to load file:', error)
    // Navigate back to file list
    router.push('/files')
  } finally {
    loading.value = false
  }
}

const openFile = async () => {
  try {
    await invoke('open_file', { path: file.value.path })
  } catch (error) {
    console.error('Failed to open file:', error)
  }
}

const editFile = () => {
  router.push(`/files/edit/${route.params.id}`)
}

const deleteFile = async () => {
  if (confirm('Are you sure you want to delete this file?')) {
    try {
      await invoke('delete_file', { path: file.value.path })
      router.push('/files') // Go back to file list
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString()
}

onMounted(() => {
  loadFile()
})
</script>
```

## Deep Linking in Tauri

### Handling External Links

While deep linking works differently in desktop applications compared to web apps, you can still handle protocol-based navigation:

```javascript
// src/main.js (updated)
import { appWindow } from '@tauri-apps/api/window'

app.mount('#app')

// Handle potential deep linking
appWindow.listen('tauri://deep-link', async (event) => {
  const payload = event.payload // URL payload
  const url = new URL(payload)
  const path = url.pathname
  
  // Navigate to the appropriate route
  router.push(path)
})
```

## Navigation Patterns for Desktop Applications

### Keyboard Shortcuts for Navigation

```vue
<!-- src/components/KeyboardNavigation.vue -->
<template>
  <div class="keyboard-nav" tabindex="0" @keydown="handleKeydown">
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleKeydown = (event) => {
  // Ctrl + Shift + H for Home
  if (event.ctrlKey && event.shiftKey && event.key === 'H') {
    event.preventDefault()
    router.push('/')
  }
  
  // Ctrl + Shift + S for Settings
  if (event.ctrlKey && event.shiftKey && event.key === 'S') {
    event.preventDefault()
    router.push('/settings')
  }
  
  // Ctrl + Shift + F for Files
  if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    event.preventDefault()
    router.push('/files')
  }
}

onMounted(() => {
  // Focus the component so it can receive key events
  document.querySelector('.keyboard-nav').focus()
})

// Ensure component can receive focus
// Add tabindex="0" to the template root
</script>
```

### Breadcrumb Navigation

```vue
<!-- src/components/Breadcrumb.vue -->
<template>
  <nav class="breadcrumb">
    <span
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      class="crumb"
    >
      <router-link
        v-if="crumb.path && index < breadcrumbs.length - 1"
        :to="crumb.path"
      >
        {{ crumb.name }}
      </router-link>
      <span v-else>{{ crumb.name }}</span>
      
      <span
        v-if="index < breadcrumbs.length - 1"
        class="separator"
      >
        /
      </span>
    </span>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(m => m.name)
  const crumbs = []
  
  matched.forEach((match) => {
    crumbs.push({
      name: match.name,
      path: match.path
    })
  })
  
  // Add current route if not already present
  if (route.name && !matched.some(m => m.name === route.name)) {
    crumbs.push({
      name: route.name,
      path: route.path
    })
  }
  
  return crumbs
})
</script>

<style scoped>
.breadcrumb {
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.crumb {
  display: inline-flex;
  align-items: center;
}

.crumb a {
  text-decoration: none;
  color: #0d6efd;
}

.crumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
  color: #6c757d;
}
</style>
```

## Route-Based State Management

### Using Route State with Pinia

```javascript
// src/stores/route.js
import { defineStore } from 'pinia'

export const useRouteStore = defineStore('route', {
  state: () => ({
    history: [],
    currentRoute: null
  }),
  
  actions: {
    addRoute(route) {
      this.history.push({
        path: route.path,
        name: route.name,
        timestamp: Date.now()
      })
      this.currentRoute = route
    },
    
    goBack() {
      if (this.history.length > 1) {
        this.history.pop() // Remove current
        const previous = this.history[this.history.length - 1]
        // This would trigger a router navigation in a real app
        return previous
      }
      return null
    }
  }
})
```

## Testing Routes

### Vue Router Testing

```javascript
// tests/unit/router.test.js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import App from '@/App.vue'

const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/about', component: { template: '<div>About</div>' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

describe('Router', () => {
  test('navigates correctly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [
          router,
          createTestingPinia()
        ]
      }
    })
    
    await router.push('/about')
    expect(wrapper.text()).toContain('About')
  })
})
```

## Best Practices

### 1. Use Hash History
- Always use `createWebHashHistory()` for Tauri applications
- Avoid `createWebHistory()` as it doesn't work properly with file:// protocol

### 2. Route Organization
- Group related routes in modules
- Use nested routes for complex components
- Implement route-based code splitting

### 3. Navigation Performance
- Preload frequently accessed routes
- Implement proper loading states
- Use transition components for smooth navigation

### 4. Error Handling
- Implement 404 pages for invalid routes
- Handle navigation errors gracefully
- Provide fallback navigation options

### 5. Desktop-Specific Considerations
- Handle window close events gracefully
- Implement proper navigation confirmation
- Support keyboard shortcuts for navigation

Vue Router works effectively in Tauri applications when properly configured with hash history. Following these patterns will help you create intuitive navigation that feels natural in a desktop environment.