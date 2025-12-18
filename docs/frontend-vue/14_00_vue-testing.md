# Vue.js Testing in Tauri Applications

Testing Vue.js components in Tauri applications requires special considerations due to the integration with Rust backend commands. This article covers comprehensive testing strategies for Tauri + Vue.js applications.

## Testing Setup for Tauri Applications

### Installing Testing Dependencies

```bash
# For unit testing
npm install -D @vue/test-utils @testing-library/vue jsdom vitest

# For mocking Tauri APIs
npm install -D @tauri-apps/api @tauri-apps/testing

# For end-to-end testing
npm install -D @playwright/test
```

### Vitest Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    include: ['tests/**/*.test.js', 'src/**/*.test.js']
  }
})
```

### Testing Setup File

```javascript
// tests/setup.js
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Tauri APIs globally
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn().mockResolvedValue(null),
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn().mockResolvedValue(null)
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn().mockResolvedValue(null)
}))

// Configure Vue Test Utils
config.global.mocks = {
  $t: (msg) => msg // Mock translation function if using i18n
}

// Mock ResizeObserver for UI frameworks
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

## Unit Testing Vue Components

### Basic Component Test

```javascript
// tests/unit/GreetingComponent.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GreetingComponent from '@/components/GreetingComponent.vue'
import { invoke } from '@tauri-apps/api/tauri'

vi.mock('@tauri-apps/api/tauri')

describe('GreetingComponent', () => {
  it('displays greeting result from backend', async () => {
    const mockResult = { message: 'Hello, Test User!' }
    invoke.mockResolvedValue(mockResult)
    
    const wrapper = mount(GreetingComponent)
    
    // Simulate user input
    await wrapper.find('input').setValue('Test User')
    await wrapper.find('button').trigger('click')
    
    // Verify the backend was called
    expect(invoke).toHaveBeenCalledWith('greet', { name: 'Test User' })
    
    // Verify the result is displayed
    await wrapper.vm.$nextTick() // Wait for async update
    expect(wrapper.text()).toContain('Hello, Test User!')
  })
  
  it('shows loading state during backend call', async () => {
    const promise = Promise.resolve({ message: 'Hello!' })
    invoke.mockReturnValue(promise)
    
    const wrapper = mount(GreetingComponent)
    await wrapper.find('input').setValue('Test User')
    await wrapper.find('button').trigger('click')
    
    // Should show loading state immediately
    expect(wrapper.find('.loading').exists()).toBe(true)
    
    await promise // Wait for promise to resolve
    await wrapper.vm.$nextTick()
    
    // Loading state should be removed
    expect(wrapper.find('.loading').exists()).toBe(false)
  })
  
  it('handles backend errors gracefully', async () => {
    const errorMessage = 'Backend error occurred'
    invoke.mockRejectedValue(new Error(errorMessage))
    
    const wrapper = mount(GreetingComponent)
    await wrapper.find('input').setValue('Test User')
    await wrapper.find('button').trigger('click')
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain(errorMessage)
  })
})
```

### Testing Components with Tauri Events

```javascript
// tests/unit/EventComponent.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EventComponent from '@/components/EventComponent.vue'
import { listen } from '@tauri-apps/api/event'

vi.mock('@tauri-apps/api/event')

describe('EventComponent', () => {
  let mockUnlisten
  
  beforeEach(() => {
    mockUnlisten = vi.fn()
    listen.mockResolvedValue(mockUnlisten)
  })
  
  it('registers event listener on mount', async () => {
    const wrapper = mount(EventComponent)
    
    expect(listen).toHaveBeenCalledWith('data-updated', expect.any(Function))
    expect(mockUnlisten).not.toHaveBeenCalled()
  })
  
  it('cleans up event listener on unmount', async () => {
    const wrapper = mount(EventComponent)
    wrapper.unmount()
    
    expect(mockUnlisten).toHaveBeenCalled()
  })
  
  it('processes received events', async () => {
    let eventHandler
    listen.mockImplementation((eventName, handler) => {
      eventHandler = handler
      return Promise.resolve(mockUnlisten)
    })
    
    const wrapper = mount(EventComponent)
    
    // Simulate receiving an event
    const mockEvent = { payload: 'test data' }
    eventHandler(mockEvent)
    
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.receivedData).toBe('test data')
  })
})
```

## Testing Pinia Stores

### Store Test Example

```javascript
// tests/unit/stores/fileStore.test.js
import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useFileStore } from '@/stores/fileStore'
import { invoke } from '@tauri-apps/api/tauri'

vi.mock('@tauri-apps/api/tauri')

describe('FileStore', () => {
  it('loads file list from backend', async () => {
    const mockFiles = [
      { id: '1', name: 'file1.txt', path: '/path/file1.txt' },
      { id: '2', name: 'file2.txt', path: '/path/file2.txt' }
    ]
    invoke.mockResolvedValue(mockFiles)
    
    const pinia = createTestingPinia()
    const store = useFileStore(pinia)
    
    await store.loadFileList()
    
    expect(invoke).toHaveBeenCalledWith('get_file_list')
    expect(store.files).toEqual(mockFiles)
    expect(store.loading).toBe(false)
  })
  
  it('handles file operations', async () => {
    const mockFile = { id: '1', name: 'test.txt', path: '/path/test.txt' }
    invoke.mockResolvedValue(mockFile)
    
    const pinia = createTestingPinia()
    const store = useFileStore(pinia)
    
    const result = await store.createFile('test.txt', 'content')
    
    expect(invoke).toHaveBeenCalledWith('create_file', {
      name: 'test.txt',
      content: 'content'
    })
    expect(result).toEqual(mockFile)
  })
  
  it('manages loading states', async () => {
    invoke.mockResolvedValue([])
    
    const pinia = createTestingPinia()
    const store = useFileStore(pinia)
    
    const promise = store.loadFileList()
    expect(store.loading).toBe(true)
    
    await promise
    expect(store.loading).toBe(false)
  })
})
```

## Mocking Tauri Commands Effectively

### Advanced Mock Setup

```javascript
// tests/mocks/tauri.js
import { vi } from 'vitest'

export const createTauriMock = () => {
  const mockInvoke = vi.fn()
  const mockListen = vi.fn()
  const mockEmit = vi.fn()
  
  return {
    invoke: mockInvoke,
    listen: mockListen,
    emit: mockEmit,
    
    // Helper to mock specific command responses
    mockCommand: (commandName, response) => {
      mockInvoke.mockImplementation((cmd, args) => {
        if (cmd === commandName) {
          return Promise.resolve(response)
        }
        throw new Error(`Unexpected command: ${cmd}`)
      })
    },
    
    // Helper to mock command rejection
    mockCommandError: (commandName, error) => {
      mockInvoke.mockImplementation((cmd, args) => {
        if (cmd === commandName) {
          return Promise.reject(error)
        }
        throw new Error(`Unexpected command: ${cmd}`)
      })
    },
    
    // Clear all mocks
    clear: () => {
      mockInvoke.mockClear()
      mockListen.mockClear()
      mockEmit.mockClear()
    }
  }
}

// Example usage in tests
export const setupTauriTest = () => {
  const tauriMock = createTauriMock()
  vi.spyOn(require('@tauri-apps/api/tauri'), 'invoke').mockImplementation(tauriMock.invoke)
  vi.spyOn(require('@tauri-apps/api/event'), 'listen').mockImplementation(tauriMock.listen)
  
  return tauriMock
}
```

### Using the Mock in Tests

```javascript
// tests/unit/FileComponent.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileComponent from '@/components/FileComponent.vue'
import { setupTauriTest } from '../mocks/tauri'

describe('FileComponent', () => {
  let tauriMock
  
  beforeEach(() => {
    tauriMock = setupTauriTest()
  })
  
  afterEach(() => {
    tauriMock.clear()
  })
  
  it('loads files correctly', async () => {
    const mockFiles = [
      { id: '1', name: 'test.txt', size: 1024 }
    ]
    tauriMock.mockCommand('get_files', mockFiles)
    
    const wrapper = mount(FileComponent)
    await wrapper.vm.loadFiles()
    
    expect(wrapper.vm.files).toEqual(mockFiles)
  })
  
  it('handles file operation errors', async () => {
    tauriMock.mockCommandError('get_files', new Error('Network error'))
    
    const wrapper = mount(FileComponent)
    await wrapper.vm.loadFiles()
    
    expect(wrapper.vm.error).toBe('Network error')
  })
})
```

## Integration Testing

### Testing Component-Store Interactions

```javascript
// tests/unit/Integration.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import FileList from '@/components/FileList.vue'
import { useFileStore } from '@/stores/fileStore'

vi.mock('@tauri-apps/api/tauri')

describe('FileList Integration', () => {
  it('displays store data correctly', async () => {
    const mockFiles = [
      { id: '1', name: 'file1.txt' },
      { id: '2', name: 'file2.txt' }
    ]
    
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        fileStore: {
          files: mockFiles,
          loading: false
        }
      }
    })
    
    const wrapper = mount(FileList, {
      global: {
        plugins: [pinia]
      }
    })
    
    // Verify component displays store data
    expect(wrapper.findAll('.file-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('file1.txt')
    expect(wrapper.text()).toContain('file2.txt')
  })
  
  it('reacts to store changes', async () => {
    const pinia = createTestingPinia()
    const store = useFileStore(pinia)
    
    const wrapper = mount(FileList, {
      global: {
        plugins: [pinia]
      }
    })
    
    // Initially empty
    expect(wrapper.findAll('.file-item')).toHaveLength(0)
    
    // Add files to store
    store.files = [
      { id: '1', name: 'new-file.txt' }
    ]
    
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.file-item')).toHaveLength(1)
  })
})
```

## End-to-End Testing with Playwright

### Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:1420', // Tauri default dev server
    headless: true,
  },
  webServer: {
    command: 'npm run tauri dev',
    url: 'http://localhost:1420',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Example

```javascript
// tests/e2e/fileOperations.spec.js
import { test, expect } from '@playwright/test'

test.describe('File Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  
  test('can upload and view files', async ({ page }) => {
    // Navigate to file page
    await page.getByRole('link', { name: 'Files' }).click()
    
    // Verify file table is visible
    await expect(page.locator('table')).toBeVisible()
    
    // Upload a file (mock upload functionality)
    await page.getByRole('button', { name: 'Upload' }).click()
    
    // Verify upload dialog appears
    await expect(page.locator('.upload-dialog')).toBeVisible()
  })
  
  test('handles authentication', async ({ page }) => {
    // Navigate to protected route
    await page.goto('/protected')
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/)
    
    // Fill login form
    await page.locator('#username').fill('testuser')
    await page.locator('#password').fill('password')
    
    // Submit form
    await page.getByRole('button', { name: 'Login' }).click()
    
    // Should redirect to protected page
    await expect(page).toHaveURL(/protected/)
  })
})
```

## Testing Forms and Validation

### Form Validation Tests

```javascript
// tests/unit/UserForm.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '@/components/UserForm.vue'
import { invoke } from '@tauri-apps/api/tauri'

vi.mock('@tauri-apps/api/tauri')

describe('UserForm', () => {
  it('validates required fields', async () => {
    const wrapper = mount(UserForm)
    
    // Submit empty form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check for validation errors
    expect(wrapper.text()).toContain('Username is required')
    expect(wrapper.text()).toContain('Email is required')
  })
  
  it('validates email format', async () => {
    const wrapper = mount(UserForm)
    
    // Enter invalid email
    await wrapper.find('#email').setValue('invalid-email')
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.text()).toContain('Please enter a valid email')
  })
  
  it('submits form with valid data', async () => {
    const mockResponse = { success: true, id: '123' }
    invoke.mockResolvedValue(mockResponse)
    
    const wrapper = mount(UserForm)
    
    // Fill form with valid data
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('SecurePass123!')
    
    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verify backend call
    expect(invoke).toHaveBeenCalledWith('create_user', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePass123!'
    })
    
    // Verify success state
    expect(wrapper.text()).toContain('User created successfully')
  })
})
```

## Testing Tauri-Specific Features

### Testing File Operations

```javascript
// tests/unit/FileOperations.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileOperations from '@/components/FileOperations.vue'
import { invoke } from '@tauri-apps/api/tauri'

vi.mock('@tauri-apps/api/tauri')

describe('FileOperations', () => {
  it('reads file content from backend', async () => {
    const fileContent = 'Hello, World!'
    invoke.mockResolvedValue(fileContent)
    
    const wrapper = mount(FileOperations)
    
    // Call read file method
    const result = await wrapper.vm.readFile('/path/to/file.txt')
    
    expect(invoke).toHaveBeenCalledWith('read_file', { path: '/path/to/file.txt' })
    expect(result).toBe(fileContent)
  })
  
  it('handles file not found errors', async () => {
    invoke.mockRejectedValue(new Error('File not found'))
    
    const wrapper = mount(FileOperations)
    
    await expect(wrapper.vm.readFile('/nonexistent.txt')).rejects.toThrow('File not found')
  })
  
  it('writes file content', async () => {
    invoke.mockResolvedValue({ success: true })
    
    const wrapper = mount(FileOperations)
    await wrapper.vm.writeFile('/path/to/file.txt', 'New content')
    
    expect(invoke).toHaveBeenCalledWith('write_file', {
      path: '/path/to/file.txt',
      content: 'New content'
    })
  })
})
```

## Mocking File System Operations

```javascript
// tests/mocks/filesystem.js
export const createFilesystemMock = () => {
  const files = new Map()
  
  return {
    // Mock file operations
    readFile: (path) => {
      if (!files.has(path)) {
        throw new Error('File not found')
      }
      return files.get(path)
    },
    
    writeFile: (path, content) => {
      files.set(path, content)
      return { success: true }
    },
    
    deleteFile: (path) => {
      if (!files.has(path)) {
        throw new Error('File not found')
      }
      files.delete(path)
      return { success: true }
    },
    
    listDirectory: (path) => {
      const fileList = []
      for (const [filePath, content] of files) {
        if (filePath.startsWith(path)) {
          fileList.push({
            name: filePath.split('/').pop(),
            path: filePath,
            size: content.length,
            isDirectory: false
          })
        }
      }
      return fileList
    },
    
    // Helper to seed mock filesystem
    seedFile: (path, content) => {
      files.set(path, content)
    },
    
    clear: () => {
      files.clear()
    }
  }
}
```

## Testing Performance Concerns

### Performance Testing

```javascript
// tests/unit/performance.test.js
import { describe, it, expect } from 'vitest'

describe('Performance Tests', () => {
  it('renders large lists efficiently', async () => {
    // Create large dataset
    const largeList = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
    
    const startTime = performance.now()
    // Render component with large list
    // ... component rendering code
    const endTime = performance.now()
    
    const renderTime = endTime - startTime
    expect(renderTime).toBeLessThan(100) // Should render in <100ms
  })
  
  it('handles concurrent commands properly', async () => {
    const commandPromises = Array.from({ length: 10 }, (_, i) => 
      invoke('get_data', { id: i })
    )
    
    const startTime = performance.now()
    const results = await Promise.all(commandPromises)
    const endTime = performance.now()
    
    // Verify all commands completed
    expect(results).toHaveLength(10)
    
    // Check that commands executed in reasonable time
    expect(endTime - startTime).toBeLessThan(5000)
  })
})
```

## Testing Best Practices

### 1. Isolate Tests

```javascript
// Always clear mocks between tests
import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  // Setup
})

afterEach(() => {
  vi.clearAllMocks()
})
```

### 2. Test Error Scenarios

```javascript
it('handles network errors gracefully', async () => {
  invoke.mockRejectedValue(new Error('Network timeout'))
  
  const wrapper = mount(Component)
  await wrapper.vm.loadData()
  
  expect(wrapper.vm.error).toBe('Network timeout')
})
```

### 3. Use Realistic Test Data

```javascript
// tests/fixtures/users.js
export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2023-01-02T00:00:00Z'
  }
]
```

### 4. Test Loading States

```javascript
it('shows loading state during async operations', async () => {
  const promise = Promise.resolve({ data: 'result' })
  invoke.mockReturnValue(promise)
  
  const wrapper = mount(Component)
  wrapper.vm.loadData()
  
  expect(wrapper.vm.loading).toBe(true)
  
  await promise
  expect(wrapper.vm.loading).toBe(false)
})
```

### 5. Use Type-Safe Mocks (with TypeScript)

```typescript
// tests/types.ts
import type { Mock } from 'vitest'
import type { InvokeArgs } from '@tauri-apps/api/tauri'

export interface MockTauriAPI {
  invoke: Mock<[string, InvokeArgs?], any>
  listen: Mock<[string, Function], any>
}

// In test files
const mockInvoke = vi.fn() as MockTauriAPI['invoke']
```

## CI/CD Testing Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run linting
      run: npm run lint
```

Testing Tauri + Vue.js applications requires careful mocking of backend operations while maintaining realistic test scenarios. Focus on testing the frontend logic, state management, and user interactions while properly isolating backend dependencies.