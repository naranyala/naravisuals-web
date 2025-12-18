# UI Frameworks

Integrating popular Vue.js UI frameworks with Tauri applications enhances the desktop experience while maintaining native-like performance. This article covers integration patterns for popular UI libraries.

## Popular Vue.js UI Frameworks for Tauri

### 1. Element Plus

Element Plus is an excellent choice for desktop applications with its rich component set and theme customization options.

#### Installation

```bash
npm install element-plus
```

#### Basic Integration

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

#### Tauri-Specific Component Usage

```vue
<template>
  <div class="tauri-app">
    <el-container>
      <el-aside width="200px">
        <el-menu
          default-active="1"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">Home</el-menu-item>
          <el-menu-item index="2">Files</el-menu-item>
          <el-menu-item index="3">Settings</el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <el-row justify="space-between" align="middle">
            <h2>My Tauri App</h2>
            <el-button @click="openSettings">Settings</el-button>
          </el-row>
        </el-header>
        
        <el-main>
          <el-card class="main-card">
            <el-table
              :data="fileList"
              style="width: 100%"
              height="400"
              @row-dblclick="handleRowDblClick"
            >
              <el-table-column prop="name" label="Name" />
              <el-table-column prop="size" label="Size" :formatter="formatSize" />
              <el-table-column prop="modified" label="Modified" :formatter="formatDate" />
              <el-table-column label="Actions">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    @click="openFile(scope.row)"
                  >
                    Open
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger"
                    @click="deleteFile(scope.row)"
                  >
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalFiles"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { ElMessage } from 'element-plus'

const fileList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalFiles = ref(0)

onMounted(() => {
  loadFileList()
})

const loadFileList = async () => {
  try {
    const result = await invoke('get_file_list', {
      page: currentPage.value,
      limit: pageSize.value
    })
    
    fileList.value = result.items
    totalFiles.value = result.total
  } catch (error) {
    ElMessage.error('Failed to load files: ' + error.message)
  }
}

const handleMenuSelect = (index) => {
  if (index === '1') {
    // Go to home
  } else if (index === '2') {
    // Go to files
    loadFileList()
  } else if (index === '3') {
    openSettings()
  }
}

const openFile = async (file) => {
  try {
    await invoke('open_file', { path: file.path })
    ElMessage.success('File opened successfully')
  } catch (error) {
    ElMessage.error('Failed to open file: ' + error.message)
  }
}

const deleteFile = async (file) => {
  try {
    await invoke('delete_file', { path: file.path })
    await loadFileList()
    ElMessage.success('File deleted')
  } catch (error) {
    ElMessage.error('Failed to delete file: ' + error.message)
  }
}

const formatSize = (row, column, cellValue) => {
  if (cellValue === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(cellValue) / Math.log(k))
  return parseFloat((cellValue / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (row, column, cellValue) => {
  return new Date(cellValue * 1000).toLocaleString()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadFileList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadFileList()
}

const openSettings = () => {
  // Navigate to settings or open modal
}
</script>
```

### 2. Vuetify

Vuetify provides Material Design components suitable for Tauri applications with its desktop-friendly design principles.

#### Installation

```bash
npm install vuetify@next @mdi/font
```

#### Integration

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
```

#### Tauri Desktop Layout with Vuetify

```vue
<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>My Tauri App</v-app-bar-title>
      
      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical" @click="showMenu = !showMenu"></v-btn>
      </template>
    </v-app-bar>
    
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="item.action"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-data-table
              :headers="headers"
              :items="fileList"
              :items-per-page="10"
              class="elevation-1"
              show-select
              v-model="selected"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="text"
                  @click="openFile(item)"
                >
                  <v-icon>mdi-open-in-app</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  @click="deleteFile(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <v-dialog v-model="showMenu" max-width="400">
      <v-card>
        <v-card-title>Application Menu</v-card-title>
        <v-card-actions>
          <v-btn @click="showSettings">Settings</v-btn>
          <v-btn @click="showAbout">About</v-btn>
          <v-btn @click="showMenu = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const drawer = ref(false)
const showMenu = ref(false)
const selected = ref([])
const fileList = ref([])

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Size', key: 'size' },
  { title: 'Modified', key: 'modified' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const menuItems = ref([
  { title: 'Home', icon: 'mdi-home', action: () => {} },
  { title: 'Files', icon: 'mdi-file-document', action: loadFileList },
  { title: 'Settings', icon: 'mdi-cog', action: showSettings }
])

function loadFileList() {
  // Implementation
}

function openFile(item) {
  // Implementation
}

function deleteFile(item) {
  // Implementation
}

function showSettings() {
  // Implementation
}

function showAbout() {
  // Implementation
}
</script>
```

### 3. PrimeVue

PrimeVue offers a comprehensive component suite with desktop application features.

#### Installation

```bash
npm install primevue primeicons
```

#### Integration

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const app = createApp(App)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Button', Button)
app.mount('#app')
```

#### Tauri File Manager with PrimeVue

```vue
<template>
  <div class="tauri-file-manager">
    <div class="p-grid">
      <div class="p-col-12">
        <div class="card">
          <h5>File Manager</h5>
          
          <DataTable
            :value="files"
            v-model:selection="selectedFiles"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :loading="loading"
            responsiveLayout="scroll"
          >
            <template #header>
              <div class="p-d-flex p-jc-between p-ai-center">
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText 
                    v-model="searchTerm" 
                    placeholder="Search files" 
                    @input="searchFiles"
                  />
                </span>
                <Button 
                  label="Refresh" 
                  icon="pi pi-refresh" 
                  @click="refreshFiles"
                />
              </div>
            </template>
            
            <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
            <Column field="name" header="Name">
              <template #body="slotProps">
                <i :class="getFileIcon(slotProps.data)"></i>
                {{ slotProps.data.name }}
              </template>
            </Column>
            <Column field="size" header="Size" :bodyStyle="{'text-align': 'right'}">
              <template #body="slotProps">
                {{ formatFileSize(slotProps.data.size) }}
              </template>
            </Column>
            <Column field="modified" header="Modified">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.modified) }}
              </template>
            </Column>
            <Column header="Actions" :bodyStyle="{'text-align': 'center'}">
              <template #body="slotProps">
                <Button
                  icon="pi pi-folder-open"
                  class="p-button-text p-button-rounded"
                  @click="openFile(slotProps.data)"
                  v-tooltip.bottom="'Open File'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-rounded p-button-danger"
                  @click="deleteFile(slotProps.data)"
                  v-tooltip.bottom="'Delete File'"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const confirm = useConfirm()
const toast = useToast()

const files = ref([])
const selectedFiles = ref([])
const loading = ref(false)
const searchTerm = ref('')

onMounted(() => {
  loadFiles()
})

const loadFiles = async () => {
  loading.value = true
  try {
    files.value = await invoke('list_files')
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    loading.value = false
  }
}

const openFile = async (file) => {
  try {
    await invoke('open_file', { path: file.path })
    toast.add({ severity: 'success', summary: 'Success', detail: 'File opened', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const deleteFile = (file) => {
  confirm.require({
    message: `Are you sure you want to delete ${file.name}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await invoke('delete_file', { path: file.path })
        await loadFiles()
        toast.add({ severity: 'success', summary: 'Success', detail: 'File deleted', life: 3000 })
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
      }
    }
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const getFileIcon = (file) => {
  if (file.isDirectory) {
    return 'pi pi-folder'
  } else if (file.name.endsWith('.txt')) {
    return 'pi pi-file'
  } else if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return 'pi pi-image'
  }
  return 'pi pi-file-o'
}

const searchFiles = (event) => {
  // Implementation for searching files
  console.log('Searching for:', event.target.value)
}

const refreshFiles = () => {
  loadFiles()
}
</script>
```

## Theme Customization for Desktop Applications

### Custom Theme for Tauri App

```css
/* assets/theme.css */
:root {
  /* Desktop-appropriate colors */
  --tauri-primary: #1976d2;
  --tauri-secondary: #4caf50;
  --tauri-background: #f5f5f5;
  --tauri-surface: #ffffff;
  --tauri-text-primary: #212121;
  --tauri-text-secondary: #757575;
  --tauri-border: #e0e0e0;
}

/* Element Plus theme override */
.el-container {
  height: 100vh;
}

.el-aside {
  background-color: var(--tauri-surface);
  border-right: 1px solid var(--tauri-border);
}

.el-header {
  background-color: var(--tauri-surface);
  border-bottom: 1px solid var(--tauri-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* Custom scrollbar for desktop feel */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus states for keyboard navigation */
*:focus {
  outline: 2px solid var(--tauri-primary);
  outline-offset: 2px;
}

/* Disabled state styling */
.el-button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Performance Optimization with UI Frameworks

### Tree Shaking Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  build: {
    rollupOptions: {
      external: ['@tauri-apps/api'],
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-router': ['vue-router'],
          'pinia': ['pinia'],
        }
      }
    }
  }
})
```

### Lazy Loading Components

```vue
<template>
  <div>
    <button @click="showAdvancedPanel = true">
      Show Advanced Settings
    </button>
    
    <component 
      v-if="showAdvancedPanel" 
      :is="AdvancedPanelComponent"
    />
  </div>
</template>

<script setup>
import { shallowRef, defineAsyncComponent } from 'vue'

const showAdvancedPanel = ref(false)

const AdvancedPanelComponent = defineAsyncComponent(() => 
  import('@/components/AdvancedSettings.vue')
)
</script>
```

## Accessibility Considerations

### ARIA Labels and Keyboard Navigation

```vue
<template>
  <div role="application" aria-label="File Manager">
    <div 
      role="menubar" 
      aria-label="Main Menu" 
      class="main-menu"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        role="menuitem"
        :aria-label="item.label"
        @keydown="handleMenuKeydown"
      >
        {{ item.label }}
      </button>
    </div>
    
    <div
      role="grid"
      aria-label="File List"
      class="file-grid"
    >
      <div
        v-for="file in files"
        :key="file.id"
        role="row"
        :aria-selected="selectedFiles.includes(file.id)"
        class="file-row"
        @keydown="handleFileKeydown"
      >
        <span role="gridcell">{{ file.name }}</span>
        <button 
          :aria-label="`Open ${file.name}`"
          @click="openFile(file)"
        >
          Open
        </button>
      </div>
    </div>
  </div>
</template>
```

## Dark/Light Mode Integration

### Theme Switching with System Preferences

```vue
<template>
  <div :class="`theme-${currentTheme}`">
    <el-button @click="toggleTheme">
      Switch to {{ currentTheme === 'light' ? 'Dark' : 'Light' }} Mode
    </el-button>
    
    <!-- UI components here -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const currentTheme = ref('light')

onMounted(() => {
  // Detect system theme preference
  detectSystemTheme()
})

const detectSystemTheme = async () => {
  try {
    // Check if system prefers dark mode
    const prefersDark = await invoke('get_system_theme_preference')
    if (prefersDark) {
      currentTheme.value = 'dark'
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  } catch (error) {
    // Fallback to system detection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme.value = 'dark'
      document.documentElement.classList.add('dark-theme')
    }
  }
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark-theme')
  
  // Save preference
  localStorage.setItem('theme', currentTheme.value)
}
</script>

<style>
/* Light theme */
.theme-light {
  --bg-color: #ffffff;
  --text-color: #212121;
  --border-color: #e0e0e0;
}

/* Dark theme */
.theme-dark {
  --bg-color: #1a1a1a;
  --text-color: #f5f5f5;
  --border-color: #444444;
}

.dark-theme .el-container,
.dark-theme .el-aside,
.dark-theme .el-header {
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}
</style>
```

## Best Practices for UI Framework Integration

### 1. Component Selection

Choose components that match desktop application UX patterns:
- Data tables for lists
- Side navigation for main menus
- Modal dialogs for confirmations
- Toolbars for actions

### 2. Performance

- Use tree-shaking to reduce bundle size
- Implement virtual scrolling for large lists
- Lazy load heavy components
- Optimize images and assets

### 3. Styling

- Customize themes to match desktop feel
- Use consistent spacing and typography
- Implement proper focus states for accessibility
- Consider dark/light mode support

### 4. Integration with Tauri

- Handle loading states for async operations
- Implement proper error handling
- Use system dialogs when appropriate
- Consider native menu integration

### 5. Testing

```javascript
// tests/unit/ui-components.test.js
import { mount } from '@vue/test-utils'
import { beforeEach, vi } from 'vitest'
import FileTable from '@/components/FileTable.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn().mockResolvedValue([])
}))

describe('FileTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  test('renders with Element Plus components', () => {
    const wrapper = mount(FileTable, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    
    expect(wrapper.find('.el-table').exists()).toBe(true)
    expect(wrapper.find('.el-pagination').exists()).toBe(true)
  })
})
```

Integrating UI frameworks with Tauri applications provides rich, professional interfaces while maintaining the desktop application feel. Choose frameworks that support your design needs and implement proper customization for the best user experience.