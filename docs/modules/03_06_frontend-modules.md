# Frontend Module Architecture in Vue

Building modular frontend architectures in Vue enables better code organization and maintainability. This guide covers essential patterns for Vue modules in Tauri applications.

## Prerequisites

- Vue 3 and Composition API
- Pinia state management
- TypeScript basics

## Core Concepts

Frontend modules are self-contained units with components, stores, services, and types for specific functionality. They provide clear boundaries while maintaining loose coupling.

## Module Structure

```
src/modules/
├── user/
│   ├── components/     # Vue components
│   ├── stores/         # Pinia stores
│   ├── services/       # API services
│   ├── composables/    # Vue composables
│   ├── types/          # TypeScript types
│   └── index.ts        # Module exports
```

## Implementation

### Module Manager

```typescript
// src/modules/moduleManager.ts
export interface FrontendModule {
  id: string;
  name: string;
  components: Record<string, DefineComponent>;
  stores: StoreDefinition[];
  initialize?: (app: App) => Promise<void>;
  dependencies?: string[];
}

export class FrontendModuleManager {
  private modules: Map<string, FrontendModule> = new Map();
  private initialized: Set<string> = new Set();

  registerModule(module: FrontendModule): void {
    this.modules.set(module.id, module);
  }

  async initializeModule(moduleId: string, app: App): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);

    // Initialize dependencies first
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        await this.initializeModule(dep, app);
      }
    }

    // Register components
    Object.entries(module.components).forEach(([name, component]) => {
      app.component(name, component);
    });

    if (module.initialize) await module.initialize(app);
    this.initialized.add(moduleId);
  }
}
```

### User Store Example

```typescript
// src/modules/user/stores/userStore.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  const fetchUsers = async () => {
    loading.value = true;
    try {
      const response = await userApi.getUsers();
      users.value = response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, fetchUsers };
});
```

### User Composable

```typescript
// src/modules/user/composables/useUser.ts
import { useUserStore } from '../stores/userStore';

export function useUser() {
  const store = useUserStore();

  const loadUsers = async () => {
    await store.fetchUsers();
  };

  return {
    users: computed(() => store.users),
    loading: computed(() => store.loading),
    loadUsers
  };
}
```

### User Component

```vue
<!-- src/modules/user/components/UserList.vue -->
<template>
  <div class="user-list">
    <h2>Users</h2>
    
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else class="users">
      <div v-for="user in users" :key="user.id" class="user-card">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUser } from '../composables/useUser';

const { users, loading, loadUsers } = useUser();

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.user-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.loading {
  text-align: center;
  padding: 40px;
}
</style>
```

## Integration

### App Registration

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { FrontendModuleManager } from './modules/moduleManager';
import userModule from './modules/user';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const moduleManager = new FrontendModuleManager();
moduleManager.registerModule(userModule);

// Initialize all modules
await moduleManager.initializeModule('user', app);

app.mount('#app');
```

## Best Practices

1. **Keep modules focused** - Single responsibility per module
2. **Use clear boundaries** - Well-defined interfaces between modules
3. **Lazy load components** - Only load when needed
4. **Type safety** - Strong TypeScript typing throughout
5. **Error boundaries** - Handle errors gracefully

## Testing

```typescript
// src/modules/user/__tests__/user.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserList from '../components/UserList';

describe('User Module', () => {
  it('renders user list', () => {
    const wrapper = mount(UserList);
    expect(wrapper.find('.user-list').exists()).toBe(true);
  });
});
```

## Summary

Frontend module architecture in Vue provides clean separation of concerns by encapsulating components, stores, and services into focused modules. This approach creates maintainable and scalable applications with clear boundaries between different features.

Continue to [Backend Modules](./03_01_backend-modules.md) for backend patterns.